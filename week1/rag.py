import os
import re
from collections.abc import Callable

from dotenv import load_dotenv
from ollama import chat

load_dotenv()

NUM_RUNS_TIMES = 5

DATA_FILES: list[str] = [
    os.path.join(os.path.dirname(__file__), "data", "api_docs.txt"),
]


def load_corpus_from_files(paths: list[str]) -> list[str]:
    """
    从给定文件路径列表中加载语料文本。
    - 若文件存在且可读：读取全文并加入语料列表
    - 若读取失败：写入带错误信息的占位文本
    - 若文件不存在：写入 missing_file 占位文本
    返回值为语料字符串列表（与输入路径一一对应）。
    """
    corpus: list[str] = []
    for p in paths:
        if os.path.exists(p):
            try:
                with open(p, encoding="utf-8") as f:
                    corpus.append(f.read())
            except Exception as exc:
                corpus.append(f"[load_error] {p}: {exc}")
        else:
            corpus.append(f"[missing_file] {p}")
    return corpus


# Load corpus from external files (simple API docs). If missing, fall back to inline snippet
CORPUS: list[str] = load_corpus_from_files(DATA_FILES)

QUESTION = (
    "Write a Python function `fetch_user_name(user_id: str, api_key: str) -> str` that calls the documented API "
    "to fetch a user by id and returns only the user's name as a string."
)


# TODO: Fill this in!
YOUR_SYSTEM_PROMPT = """
You need to carefully read the content provided in the `Context` within the question and use the Context as a reference corpus to answer the question.
"""


# For this simple example
# For this coding task, validate by required snippets rather than exact string
REQUIRED_SNIPPETS = [
    "def fetch_user_name(",
    "requests.get",
    "/users/",
    "X-API-Key",
    "return",
]


def YOUR_CONTEXT_PROVIDER(corpus: list[str]) -> list[str]:
    """TODO: Select and return the relevant subset of documents from CORPUS for this task.

    For example, return [] to simulate missing context, or [corpus[0]] to include the API docs.
    """
    """根据任务从 CORPUS 中选择并返回相关上下文文档。

    你可以：
    - 返回 []：模拟“不给上下文”
    - 返回 [corpus[0]]：提供 API 文档
    - 返回多个文档：模拟更完整检索结果
    """
    return [corpus[0]]


def make_user_prompt(question: str, context_docs: list[str]) -> str:
    """构建发送给模型的 user prompt。

    内容包含：
    1) Context:仅允许使用的上下文信息
    2) Task:要完成的代码任务
    3) Requirements:实现要求(URL、鉴权、错误处理、返回值)
    4) Output:输出格式约束(单个 Python fenced code block)
    """
    if context_docs:
        context_block = "\n".join(f"- {d}" for d in context_docs)
    else:
        context_block = "(no context provided)"
    return f"""Context (use ONLY this information):
        {context_block}

        Task: {question}

        Requirements:
        - Use the documented Base URL and endpoint.
        - Send the documented authentication header.
        - Raise for non-200 responses.
        - Return only the user's name string.

        Output: A single fenced Python code block with the function and necessary imports.
        """


def extract_code_block(text: str) -> str:
    """Extract the last fenced Python code block, or any fenced code block, else return text."""
    # Try ```python ... ``` first
    m = re.findall(r"```python\n([\s\S]*?)```", text, flags=re.IGNORECASE)
    if m:
        return m[-1].strip()
    # Fallback to any fenced code block
    m = re.findall(r"```\n([\s\S]*?)```", text)
    if m:
        return m[-1].strip()
    return text.strip()


def test_your_prompt(
    system_prompt: str, context_provider: Callable[[list[str]], list[str]]
) -> bool:
    """Run up to NUM_RUNS_TIMES and return True if any output matches EXPECTED_OUTPUT."""
    context_docs = context_provider(CORPUS)
    user_prompt = make_user_prompt(QUESTION, context_docs)

    for idx in range(NUM_RUNS_TIMES):
        print(f"Running test {idx + 1} of {NUM_RUNS_TIMES}")
        response = chat(
            model="llama3.1:8b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            options={"temperature": 0.0},
        )
        output_text = response.message.content
        code = extract_code_block(output_text)
        missing = [s for s in REQUIRED_SNIPPETS if s not in code]
        if not missing:
            print(output_text)
            print("SUCCESS")
            return True
        else:
            print("Missing required snippets:")
            for s in missing:
                print(f"  - {s}")
            print("Generated code:\n" + code)
    return False


if __name__ == "__main__":
    test_your_prompt(YOUR_SYSTEM_PROMPT, YOUR_CONTEXT_PROVIDER)
