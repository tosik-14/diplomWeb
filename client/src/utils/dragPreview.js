export const createCustomDragPreview = (e, draggedFiles) => {
    if (draggedFiles.length === 1) return; // если один файл оставляем всё стандартно

    const dragPreview = document.createElement('div'); // создаем элемент со стилями
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-9999px';
    dragPreview.style.left = '-9999px';
    dragPreview.style.display = 'flex';
    dragPreview.style.alignItems = 'center';
    dragPreview.style.gap = '8px';
    dragPreview.style.padding = '8px 12px';
    dragPreview.style.background = '#fff';
    dragPreview.style.border = '1px solid #ccc';
    dragPreview.style.borderRadius = '6px';
    dragPreview.style.fontSize = '14px';
    dragPreview.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = 1000;
    dragPreview.style.fontFamily = 'Montserrat, sans-serif';

    const icon = document.createElement('img'); //втыкаем иконку со стилями
    icon.src = `${process.env.PUBLIC_URL}/icons/files_icons/DOCX.svg`;
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.flexShrink = '0';
    icon.draggable = false;

    const text = document.createElement('span'); //текст
    text.textContent = `Файлов: ${draggedFiles.length}`;

    dragPreview.appendChild(icon); //добавляем
    dragPreview.appendChild(text);

    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);

    setTimeout(() => {
        document.body.removeChild(dragPreview); // удаляем когда юзер отпустил
    }, 0);
};