from openai import OpenAI
import os
import tkinter as tk
from tkinter import scrolledtext, ttk
import threading

class AIChatApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI聊天助手")
        self.root.geometry("600x500")
        self.root.resizable(True, True)

        # 创建主框架
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # 创建聊天记录区域
        self.chat_frame = ttk.LabelFrame(self.main_frame, text="聊天记录", padding="10")
        self.chat_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        self.chat_text = scrolledtext.ScrolledText(self.chat_frame, wrap=tk.WORD, state=tk.DISABLED)
        self.chat_text.pack(fill=tk.BOTH, expand=True)

        # 创建输入区域
        self.input_frame = ttk.LabelFrame(self.main_frame, text="输入问题", padding="10")
        self.input_frame.pack(fill=tk.X, pady=(0, 10))

        self.input_text = scrolledtext.ScrolledText(self.input_frame, wrap=tk.WORD, height=3)
        self.input_text.pack(fill=tk.X, expand=True, pady=(0, 10))

        # 创建按钮区域
        self.button_frame = ttk.Frame(self.input_frame)
        self.button_frame.pack(fill=tk.X, pady=(5, 0))

        self.send_button = ttk.Button(self.button_frame, text="发送", command=self.send_message)
        self.send_button.pack(side=tk.RIGHT, padx=(10, 0), pady=5)

        self.clear_button = ttk.Button(self.button_frame, text="清空", command=self.clear_chat)
        self.clear_button.pack(side=tk.RIGHT, pady=5)

        # 添加回车键发送功能
        self.input_text.bind('<Return>', lambda event: self.send_message())
        self.input_text.bind('<Shift-Return>', lambda event: self.input_text.insert(tk.END, '\n'))

        # 创建状态区域
        self.status_var = tk.StringVar()
        self.status_var.set("就绪")
        self.status_label = ttk.Label(self.main_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)

        # 初始化OpenAI客户端
        self.client = OpenAI(
            api_key="sk-6621a79cba0846058e4e6ff54d9e54e4",
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )

        # 初始化消息历史
        self.messages = []

    def append_to_chat(self, text, is_user=False):
        self.chat_text.config(state=tk.NORMAL)
        if is_user:
            self.chat_text.insert(tk.END, "\n你: " + text + "\n")
        else:
            self.chat_text.insert(tk.END, text)
        self.chat_text.see(tk.END)
        self.chat_text.config(state=tk.DISABLED)

    def get_ai_response(self, message):
        try:
            # 更新消息历史
            self.messages.append({"role": "user", "content": message})

            # 在UI中添加AI回复的开始标记
            self.root.after(0, lambda: self.append_to_chat("\nAI: "))

            # 调用API
            completion = self.client.chat.completions.create(
                model="qwen3-max",
                messages=self.messages,
                max_tokens=100,
                temperature=0.7,
                extra_body={"enable_thinking": False},
                stream=True
            )

            # 处理流式响应
            response_text = ""
            for chunk in completion:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                    response_text += delta.content
                    # 更新UI
                    self.root.after(0, lambda text=delta.content: self.append_to_chat(text))

            # 更新消息历史
            self.messages.append({"role": "assistant", "content": response_text})

            # 更新状态
            self.root.after(0, lambda: self.status_var.set("就绪"))
        except Exception as e:
            error_message = f"\n错误: {str(e)}"
            self.root.after(0, lambda: self.append_to_chat(error_message))
            self.root.after(0, lambda: self.status_var.set("发生错误"))
        finally:
            # 重新启用发送按钮
            self.root.after(0, lambda: self.send_button.config(state=tk.NORMAL))

    def clear_chat(self):
        self.chat_text.config(state=tk.NORMAL)
        self.chat_text.delete(1.0, tk.END)
        self.chat_text.config(state=tk.DISABLED)
        self.messages = []

    def send_message(self):
        message = self.input_text.get(1.0, tk.END).strip()
        if not message:
            return

        # 清空输入框
        self.input_text.delete(1.0, tk.END)

        # 添加用户消息到聊天记录
        self.append_to_chat(message, is_user=True)

        # 更新状态
        self.status_var.set("AI正在思考...")
        self.send_button.config(state=tk.DISABLED)

        # 在新线程中处理API调用
        threading.Thread(target=self.get_ai_response, args=(message,)).start()

    def get_ai_response(self, message):
        try:
            # 更新消息历史
            self.messages.append({"role": "user", "content": message})

            # 调用API
            completion = self.client.chat.completions.create(
                model="qwen3-max",
                messages=self.messages,
                max_tokens=100,
                temperature=0.7,
                extra_body={"enable_thinking": False},
                stream=True
            )

            # 处理流式响应
            response_text = ""
            for chunk in completion:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                    response_text += delta.content
                    # 更新UI
                    self.root.after(0, lambda text=delta.content: self.append_to_chat(text))

            # 更新消息历史
            self.messages.append({"role": "assistant", "content": response_text})

            # 更新状态
            self.root.after(0, lambda: self.status_var.set("就绪"))
        except Exception as e:
            error_message = f"错误: {str(e)}"
            self.root.after(0, lambda: self.append_to_chat(error_message))
            self.root.after(0, lambda: self.status_var.set("发生错误"))
        finally:
            # 重新启用发送按钮
            self.root.after(0, lambda: self.send_button.config(state=tk.NORMAL))

if __name__ == "__main__":
    root = tk.Tk()
    app = AIChatApp(root)
    root.mainloop()