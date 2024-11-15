import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../Icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../Icons/PlusIcon";
import Taskcard from "./Taskcard";
import Bookmark from "../Icons/Bookmark";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
  updateTask: (id: Id, content: string) => void;
}

const ColumnContainer = ({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask
}: Props) => {
  const [editMode, setEditMode] = useState(false);

  const taskIds = useMemo(() => {
    return tasks.map((task)=>task.id)
  },[tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
       bg-columnBackgroundColor
       w-[350px]
       h-[500px]
       max-h-[500px]
       rounded-md
       flex
       flex-col
       opacity-40
       border-rose-500
       border-2
      "
      ></div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
       bg-columnBackgroundColor
       w-[350px]
       h-[500px]
       max-h-[500px]
       rounded-md
       flex
       flex-col
      "
    >
      {/* column title */}
      <div
        onClick={() => setEditMode(true)}
        {...attributes}
        {...listeners}
        className="
           bg-mainBackgroundColor
           text-md
           h-[60px]
           cursor-grab
           rounded-md
           rounded-b-none
           p-3
           font-bold
           border-columnBackgroundColor
           border-4
           flex
           items-center
           justify-between
          "
      >
        <div className="flex gap-2">
          <div
            className="
             justify-center
             items-center
             bg-columnBackgroundColor
             px-2
             py-1
             text-sm
             rounded-full
          "
          >
            <Bookmark/>
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="
                          bg-black
                          focus:border-rose-500 border rounded outline-none px-2
                          "
              value={column.title}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              autoFocus
              onBlur={() => setEditMode(false)}
              onChange={(e) => updateColumn(column.id, e.target.value)}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="
            stroke-gray-500
            hover:stroke-white
            hover:bg-columnBackgroundColor
            rounded
            px-1
            py-2
        "
        >
          <TrashIcon />
        </button>
      </div>
      {/* column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <Taskcard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* column footer */}
      <button
        onClick={() => createTask(column.id)}
        className="
        flex
        gap-2
        items-center
        border-columnBackgroundColor
        border-2
        rounded-md
        p-4
        border-x-columnBackgroundColor
        hover:bg-mainBackgroundColor
        hover:text-rose-500
        active:bg-black
        "
      >
        {" "}
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
