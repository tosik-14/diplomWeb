import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import './NameInputModal.css';
import '../../styles/global.css';

const PUBLIC_URL = process.env.PUBLIC_URL;

const NameInputModal = ({ initialName = 'Новая папка', isFile = false, onClose, onSave }) => {
    const nodeRef = useRef(null);
    const [name, setName] = useState('');
    const [extension, setExtension] = useState('');

    useEffect(() => {
        if (isFile) { // если файл, то убираем формат из названия
            const match = initialName.match(/\.(docx?|pdf|txt)$/i); //находим формат
            if (match) { //если оно есть, то продолжаем
                const ext = match[0]; // записываем формат
                const base = initialName.replace(ext, '');// в base записываем имя без формата
                setName(base);  //только само имя будет отображаться
                setExtension(ext); //запоминаем формат
            } else {
                setName(initialName); //ну это случай для папки
                setExtension('');
            }
        } else {
            setName(initialName);
        }
    }, [initialName, isFile]);

    useEffect(() => { //чтобы закрыть
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSave = () => {
        const trimmed = name.trim();
        if (trimmed) {
            const finalName = isFile ? trimmed + extension : trimmed;
            onSave(finalName); // отправляем название на сохранение
            onClose();
        }
    };

    return (
        <div className="name-input__backdrop">

            <Draggable handle=".name-input__header" nodeRef={nodeRef} bounds="parent">

                <div className="name-input" ref={nodeRef}>

                    <div className="name-input__header">
                        <span className="name-input__title font-20">Введите имя</span>

                        <button onClick={onClose} className="name-input__close">
                            <img src={`${PUBLIC_URL}/icons/close.svg`} alt="close" />
                        </button>

                    </div>



                    <div className="name-input__content">

                        <div className="name-input__field-wrapper">

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="name-input__field font-16"
                                autoFocus
                            />
                        </div>



                        <div className="name-input__save-wrapper">
                            <button onClick={handleSave} className="button_st name-input__save font-16">
                                Сохранить
                            </button>
                        </div>

                    </div>
                </div>

            </Draggable>

        </div>
    );
};

export default NameInputModal;