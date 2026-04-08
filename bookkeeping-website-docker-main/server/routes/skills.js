const express = require('express')
const multer = require('multer')
const AdmZip = require('adm-zip')
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')
const { pool } = require('../config/database')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true)
    } else {
      cb(new Error('Only ZIP files are allowed'), false)
    }
  }
})

// Upload skill package
router.post('/upload', auth, upload.single('skillPackage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const packageId = Date.now().toString() + Math.floor(Math.random() * 1000)
    const fileName = req.file.originalname.replace('.zip', '')

    // Insert into database
    await pool.query(
      'INSERT INTO skill_packages (id, user_id, name, file_path, status) VALUES (?, ?, ?, ?, ?)',
      [packageId, req.userId, fileName, req.file.path, 'pending']
    )

    // Process the zip file
    const skills = await processSkillPackage(req.file.path, packageId, req.userId)

    // Update package status to processed
    await pool.query(
      'UPDATE skill_packages SET status = ?, extracted_skills = ? WHERE id = ?',
      ['processed', JSON.stringify(skills), packageId]
    )

    res.json({
      success: true,
      message: `Successfully imported ${skills.length} skills`,
      data: {
        packageId,
        skillsImported: skills.length
      }
    })

  } catch (error) {
    console.error('Skill package upload error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process skill package'
    })
  }
})

// Process skill package
async function processSkillPackage(filePath, packageId, userId) {
  const zip = new AdmZip(filePath)
  const zipEntries = zip.getEntries()
  const skills = []

  for (const entry of zipEntries) {
    if (entry.entryName.endsWith('.json') && !entry.isDirectory) {
      try {
        const content = entry.getData().toString('utf8')
        const skillData = JSON.parse(content)

        if (skillData.name && skillData.description && skillData.keywords && skillData.code) {
          const skillId = Date.now().toString() + Math.floor(Math.random() * 1000)

          // Insert skill into database
          await pool.query(
            'INSERT INTO user_skills (id, user_id, package_id, name, description, keywords, code) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              skillId,
              userId,
              packageId,
              skillData.name,
              skillData.description,
              JSON.stringify(skillData.keywords),
              skillData.code
            ]
          )

          skills.push({
            id: skillId,
            name: skillData.name,
            description: skillData.description
          })
        }
      } catch (parseError) {
        console.error('Error parsing skill file:', entry.entryName, parseError)
      }
    }
  }

  return skills
}

// Get user's skills
router.get('/user', auth, async (req, res) => {
  try {
    const [skills] = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    )

    res.json({
      success: true,
      data: skills.map(skill => ({
        ...skill,
        keywords: JSON.parse(skill.keywords || '[]')
      }))
    })
  } catch (error) {
    console.error('Get skills error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get skills'
    })
  }
})

// Delete a skill
router.delete('/:skillId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_skills WHERE id = ? AND user_id = ?',
      [req.params.skillId, req.userId]
    )

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    })
  } catch (error) {
    console.error('Delete skill error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill'
    })
  }
})

// Update a skill
router.put('/:skillId', auth, async (req, res) => {
  try {
    const { name, description, keywords, code } = req.body

    await pool.query(
      'UPDATE user_skills SET name = ?, description = ?, keywords = ?, code = ? WHERE id = ? AND user_id = ?',
      [name, description, JSON.stringify(keywords), code, req.params.skillId, req.userId]
    )

    res.json({
      success: true,
      message: 'Skill updated successfully'
    })
  } catch (error) {
    console.error('Update skill error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    })
  }
})

module.exports = router
