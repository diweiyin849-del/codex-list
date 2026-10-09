"""一个无需第三方依赖的命令行待办清单：python todo.py。"""

import json
from pathlib import Path


DATA_FILE = Path(__file__).with_name("todo_data.json")


def load_tasks():
    if not DATA_FILE.exists():
        return []
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def save_tasks(tasks):
    DATA_FILE.write_text(
        json.dumps(tasks, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def show_tasks(tasks):
    if not tasks:
        print("暂无任务，添加一个吧！")
    for index, task in enumerate(tasks, start=1):
        marker = "✓" if task["done"] else " "
        print(f"{index}. [{marker}] {task['title']}")


def main():
    tasks = load_tasks()
    while True:
        print("\n1. 查看任务  2. 添加任务  3. 完成任务  0. 退出")
        choice = input("请选择：").strip()
        if choice == "0":
            break
        if choice == "1":
            show_tasks(tasks)
        elif choice == "2":
            title = input("任务内容：").strip()
            if title:
                tasks.append({"title": title, "done": False})
                save_tasks(tasks)
                print("已添加。")
            else:
                print("任务内容不能为空。")
        elif choice == "3":
            show_tasks(tasks)
            try:
                index = int(input("要完成的任务编号：")) - 1
                if not 0 <= index < len(tasks):
                    raise ValueError
            except ValueError:
                print("请输入有效的任务编号。")
                continue
            tasks[index]["done"] = True
            save_tasks(tasks)
            print("已完成！")
        else:
            print("请选择 0、1、2 或 3。")


if __name__ == "__main__":
    main()
