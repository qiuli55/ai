import gradio as gr
import os
# 关键环境变量，修复Windows下启动卡死
os.environ["GRADIO_ALLOW_QUEUE_THREAD"] = "False"

def reply(msg):
    return "测试成功"

demo = gr.Interface(fn=reply, inputs="text", outputs="text")
demo.launch(server_port=7860, share=False, enable_queue=False)