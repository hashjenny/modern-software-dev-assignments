# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "fastmcp",
# ]
# ///
from pathlib import Path
from typing import Any

from fastmcp import FastMCP

# 建立一个 MCP 服务器实例
mcp = FastMCP(name="SimpleMCPTestServer")


# helper: 把用户输入的路径转成「绝对路径」
def resolve_abs_path(path_str: str) -> Path:
    """
    [功能]把用户输入的路径转成「绝对路径」

    示例:
      file.py -> /Users/home/mihail/modern-software-dev-lectures/file.py
    """
    path = Path(path_str).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    return path


# @mcp.tool 是一个装饰器
# 它会把这个函数注册成 MCP 工具(tool)，让 Host/Client 可以列出并调用它
@mcp.tool
def read_file_tool(filename: str) -> dict[str, Any]:
    """
    [功能]读取用户指定文件的完整内容

    参数:
      filename: 要读取的文件路径(可相对或绝对)

    返回:
      - file_path: 文件的绝对路径(字符串)
      - content: 文件内容(字符串)
    """
    full_path = resolve_abs_path(filename)
    print(full_path)  # 打印实际读取到的路径，方便调试
    if not full_path.exists():
        return {"file_path": str(full_path), "error": "file not found"}
    if not full_path.is_file():
        return {"file_path": str(full_path), "error": "path is not a file"}
    try:
        with open(str(full_path), encoding="utf-8") as f:
            content = f.read()
    except (OSError, UnicodeDecodeError) as exc:
        return {"file_path": str(full_path), "error": str(exc)}
    return {"file_path": str(full_path), "content": content}


@mcp.tool
def list_files_tool(path: str) -> dict[str, Any]:
    """
    [功能]列出用户提供的目录下有哪些文件/子目录

    参数:
      path: 要列出内容的目录路径

    返回:
      - path: 目录的绝对路径(字符串)
      - files: 一个数组,每个元素包含:
          - filename: 文件名
          - type: "file" 或 "dir"
    """
    full_path = resolve_abs_path(path)
    all_files = []
    for item in full_path.iterdir():
        isFile = item.is_file()
        all_files.append(
            {
                "filename": ("💙" if isFile else "📂") + item.name,
                "type": "file" if isFile else "dir",
            }
        )
    return {"path": str(full_path), "files": all_files}


@mcp.tool
def edit_file_tool(path: str, old_str: str, new_str: str) -> dict[str, Any]:
    """
    [功能]编辑文件内容
    - 用 new_str 替换第一次出现的 old_str
    - 若 old_str 是空字符串 "":则直接用 new_str 创建/覆盖文件

    参数:
        path: 要编辑的文件路径
        old_str: 要被替换的旧字符串
        new_str: 替换成的新字符串

    返回:
        - path: 文件绝对路径(字符串)
        - action: 执行结果(created_file / edited / old_str not found)
    """
    full_path = resolve_abs_path(path)
    p = Path(full_path)

    # old_str 是空字符串:直接创建或覆盖整个文件内容
    if old_str == "":
        p.write_text(new_str, encoding="utf-8")
        return {"path": str(full_path), "action": "created_file"}

    original = p.read_text(encoding="utf-8")

    # 找不到 old_str 就返回
    if original.find(old_str) == -1:
        return {"path": str(full_path), "action": "old_str not found"}

    # 只替换第一次出现的 old_str
    edited = original.replace(old_str, new_str, 1)
    p.write_text(edited, encoding="utf-8")
    return {"path": str(full_path), "action": "edited"}


if __name__ == "__main__":
    # 启动 MCP server
    mcp.run()
