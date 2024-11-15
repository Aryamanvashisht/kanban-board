import { useMemo, useState } from "react";
import PlusIcon from "../Icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Taskcard from "./Taskcard";

const Kanbanboard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  function generateId() {
    return Math.floor(Math.random() * 1001);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const filteredCol = columns.filter((col) => col.id !== id);
    setColumns(filteredCol);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTask = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTask);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";

    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    //I am dropping a task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((task) => {
        const activeIndex = task.findIndex((t) => t.id === activeId);

        const overIndex = task.findIndex(t => t.id === overId);
        
       task[activeIndex].columnId = task[overIndex].columnId;
        
        return arrayMove(task, activeIndex, overIndex);
      });
    }
     
    const isOverColumn = over.data.current?.type === 'Column';
    //I am dropping a task over another Column
    if (isActiveTask && isOverColumn)
    {
       setTasks((task) => {
         const activeIndex = task.findIndex((t) => t.id === activeId);

         task[activeIndex].columnId = overId

         return arrayMove(task, activeIndex, activeIndex);
       });
    }

  }

  return (
    <div
      className="
            m-auto
            flex
            min-h-screen
            w-full
            items-center
            overflow-x-auto
            overflow-y-hidden
            px-[40px]
           "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  updateTask={updateTask}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  key={col.id}
                  column={col}
                  updateColumn={updateColumn}
                  deleteColumn={deleteColumn}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>

          <button
            onClick={createNewColumn}
            className="
               h-[60px]
               w-[350px]
               min-w-[350px]
               cursor-pointer
               rounded-lg
               bg-mainBackgroundColor
               border-2
               border-columnBackgroundColor
               p-4
               ring-rose-500
               hover:ring-2
               flex
               gap-2 
              "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                deleteTask={deleteTask}
                createTask={createTask}
                updateColumn={updateColumn}
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <Taskcard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default Kanbanboard;
