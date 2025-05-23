import React, {useEffect, useRef, useState} from 'react';
//import Draggable from 'react-draggable';
import DropZone from "../../../shared/lib/DropZone/DropZone";
import { useNavigate } from 'react-router-dom';
import '../styles/TicketCteator.css';
import '../../../shared/styles/global.css';
import { startResize } from '../../../shared/utils/resizer'
import {useTicketCreatorHooks} from "../hooks/useTicketCreatorHooks";
import {useCreateTicketSubmit} from "../model/useCreateTicketSubmit";
import {useTicketCreator} from "../model/useTicketCreator";
import { useCustomDraggable } from '../../../shared/hooks/useCustomDraggable';
import { validateFile, validateFileFromStorage, createTickets } from '../api/ticketApi'


import UploadIcon from '../../../shared/icons/UploadIcon';
import DeleteIcon from "../../../shared/icons/DeleteIcon";

import {useWindowPosition} from "../../../shared/hooks/useWindowPosition";
import {useAdminPanel} from "../../../pages/admin/model/useAdminPanel";


const PUBLIC_URL = process.env.PUBLIC_URL;


const TicketCreator = ({ user, visible, onClose }) => {
    const navigate = useNavigate();

    const [dropAreasCount, setDropAreasCount] = useState(1); //количество дропзон для разных типов вопросов
    const [dropZoneFiles, setDropZoneFiles] = useState(
        Array(dropAreasCount).fill([]) // двумерный массив для хранения файлов в случае разных типов вопросов. формат: [ [ файл1, файл2 ], [ ], и т.д. до 5]
    );  //от dropAreasCount зависит "вторая мерность хз, короче j"

    const [userPosition, setUserPosition] = useState(null); //должность. информация из бд, в будущем ее количество может расти. Например для уника, или факультета и тд
    const [userName, setUserName] = useState(null); // ФИО юзера

    const { position, setPosition, size, setSize } = useWindowPosition({ width: 835, height: 600 });

    useEffect(() => {
        if (user) {
            const userNameBuf = `${user.secondName} ${user.firstName[0]}.${user.patronymic ? `${user.patronymic[0]}.` : ''}`;
            setUserName(userNameBuf);
            setUserPosition(user.position);
        }
    }, [user]);

    const nodeRef = useRef(null);
    const fileZoneRefs = useRef([]); // массив ссылок на ДОМ элементы дропзоны, чтобы каждая кнопка загрузить отвечала за свою дропзону
    const [isNarrow, setIsNarrow] = useState([]);//тру если дропзона меньше 216пх
    const zoneRefs = useRef([]); //ссылки на дропзоны

    const [emptyInput, setEmptyInput] = useState(false);  // флаг ошибки
    const [emptyInputMessage, setEmptyInputMessage] = useState(''); // текст ошибки, приходит из DropZone

    const [ticketCount, setTicketCount] = useState(30); //количество билетов
    const [ticketsFileName, setTicketsFileName] = useState('Билеты'); // имя файлов с билетами

    const [university, setUniversity] = useState("БЕЛОРУССКИЙ НАЦИОНАЛЬНЫЙ ТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ"); //название университета
    const [faculty, setFaculty] = useState("Факультет Информационных Технологий и Робототехники"); // название факультет
    const [discipline, setDiscipline] = useState("Основы Алгоритмизации и Программирования"); // название дисциплины

    const [department, setDepartment] = useState("Программное обеспечение информационных систем и технологий"); //название кафедры
    const [headOfDepartment, setHeadOfDepartment] = useState("Полозков Ю.В."); // зав кафедры


    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); //
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear());

    const [season, setSeason] = useState(null); // зимняя или летняя сессия - winter или summer
    const [startYear, setStartYear] = useState(year.slice(2, 4)); // год начала учебной сессии
    const [endYear, setEndYear] = useState((parseInt(year.slice(2, 4)) + 1).toString()); //год конца учебной сессии
    const [approvalDay, setApprovalDay] = useState(day);//день утверждения билетов
    const [approvalMonth, setApprovalMonth] = useState(month);//месяц утверждения билетов
    const [approvalYear, setApprovalYear] = useState(year);//год утверждения билетов

    const [ticketProtocol, setTicketProtocol] = useState(1);//номер протокола
    const { handleMouseDown } = useCustomDraggable({ size, position, setPosition });

    const { handleCreateTickets } = useCreateTicketSubmit();

    const {
        questionsPerType,
        handleFileUpload,
        handleServerFileDrop,
        handleRemoveFile,
        handleAddType,
        handleRemoveType,
        handleQuestionCountChange,
        errorAlert,
        handleSetSeason,
        fileError,
        fileErrorMessage,
        setFileErrorMessage,
        setFileError,
    } = useTicketCreator({
        dropZoneFiles,
        setDropZoneFiles,
        dropAreasCount,
        setDropAreasCount,
        setEmptyInput,
        setEmptyInputMessage,
        setSeason,
    });

    useTicketCreatorHooks({
        dropAreasCount,
        setDropZoneFiles,
        zoneRefs,
        setIsNarrow,
        size,
    });

    const handleTicketsCreate = async () => {
        await handleCreateTickets({
            ticketCount,
            dropZoneFiles,
            questionsPerType,
            ticketsFileName,
            university,
            faculty,
            discipline,
            department,
            headOfDepartment,
            userName,
            userPosition,
            ticketProtocol,
            season,
            startYear,
            endYear,
            approvalDay,
            approvalMonth,
            approvalYear,
            createTickets,
            navigate,
            onClose,
            errorAlert,
        });
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);


    useEffect(() => { //изменяем массив рефов в зависимости от числа дропзон
        fileZoneRefs.current = Array(dropAreasCount).fill().map((_, i) => fileZoneRefs.current[i] || React.createRef());
    }, [dropAreasCount]);

    const handleUploadFile = (i) => {
        fileZoneRefs.current[i]?.current?.openFileDialog(); //проводник будет отправлять файлы только в конкретную дропзону
    };


    if (position === null) return null;
    return (
        <div className="ticket-creator__backdrop">
            <div
                className="ticket-creator__wrapper"
                ref={nodeRef}
                style={{
                    display: visible ? 'block' : 'none',
                    width: size.width,
                    height: size.height,
                    position: 'absolute',
                    /*background: 'red',*/

                    left: position.x,
                    top: position.y,
                    transform: 'none',
                }}
                >

                <div className="ticket-creator">
                    <div
                        className="ticket-creator__header"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: 'grab' }}
                    >
                        <div className="ticket-creator__header-wrapper font-20" draggable={false}>
                            Настройка генерации
                            <button onClick={onClose} className="ticket-creator__close">
                                <img src={`${PUBLIC_URL}/icons/close_white.svg`} alt="close" width={25} height={25} draggable={false} />
                            </button>
                        </div>
                    </div>


                    <div className="ticket-creator__modal">


                        <div className="ticket-creator__row ticket-num--filename">

                            <div className="input-with-clear input-medium">
                                <label className="font-14">Название файла:</label>
                                <input
                                    type="text"
                                    className="ticket-creator__input font-16"
                                    placeholder="Введите название"
                                    value={ticketsFileName}
                                    onChange={(e) => setTicketsFileName(e.target.value)}

                                />
                                {ticketsFileName && (
                                    <button className="clear-button" onClick={() => setTicketsFileName("")}>
                                        <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                    </button>
                                )}
                            </div>

                            <div className="ticket-creator__row">
                                <label>Количество билетов:</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="ticket-creator__input-smaller input-small font-16"
                                    placeholder="?"
                                    value={ticketCount}
                                    onChange={(e) => {
                                        const parsed = parseInt(e.target.value, 10);
                                        if (!isNaN(parsed) && parsed >= 1) {
                                            setTicketCount(parsed);
                                        } else {
                                            setTicketCount(null);  //если пустое поле или что-то непонятное, количество билетов null
                                        }
                                    }}
                                />
                            </div>


                        </div>


                        <div className="ticket-creator__row">

                            <div className="ticket-creator__column input-column">
                                {/*<input className="ticket-creator__input input-wide font-16" placeholder="Белорусский Национальный Технический Университет" />*/}
                                <div className="input-with-clear">

                                    <label className="font-14">Университет:</label>
                                    <input
                                        type="text"
                                        className="ticket-creator__input input-wide font-16"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="Введите университет"
                                    />
                                    {university && (
                                        <button className="clear-button" onClick={() => setUniversity("")}>
                                            <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                        </button>
                                    )}

                                </div>



                                <div className="input-with-clear">
                                    <label className="font-14">Факультет:</label>
                                    <input
                                        type="text"
                                        className="ticket-creator__input input-wide font-16"
                                        value={faculty}
                                        onChange={(e) => setFaculty(e.target.value)}
                                        placeholder="Введите факультет"
                                    />
                                    {faculty && (
                                        <button className="clear-button" onClick={() => setFaculty("")}>
                                            <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="input-with-clear">
                                    <label className="font-14">Дисциплина:</label>
                                    <input
                                        type="text"
                                        className="ticket-creator__input input-wide font-16"
                                        value={discipline}
                                        onChange={(e) => setDiscipline(e.target.value)}
                                        placeholder="Введите дисциплину"
                                    />
                                    {discipline && (
                                        <button className="clear-button" onClick={() => setDiscipline("")}>
                                            <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="input-with-clear">
                                    <label className="font-14">Кафедра:</label>
                                    <input
                                        type="text"
                                        className="ticket-creator__input input-wide font-16"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="Введите кафедру"
                                    />
                                    {department && (
                                        <button className="clear-button" onClick={() => setDepartment("")}>
                                            <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>





                        {/*<div className="ticket-creator__session-row-wrapper">*/}

                            <div className="ticket-creator__row session-row">

                                <div className="ticket-creator__row">
                                    <label>Сессия:</label>
                                    <span>
                                        <button
                                            onClick={() => handleSetSeason('winter')}
                                            /*className="ticket-creator__double-btn session-winter"*/
                                            className={`ticket-creator__double-btn session-winter ${season === 'winter' ? 'active' : ''}`}
                                        >
                                            Зимняя
                                        </button>
                                        <button
                                            onClick={() => handleSetSeason('summer')}
                                            /*className="ticket-creator__double-btn session-summer"*/
                                            className={`ticket-creator__double-btn session-summer ${season === 'summer' ? 'active' : ''}`}
                                        >
                                            Летняя
                                        </button>
                                    </span>
                                </div>

                                <div className="ticket-creator__row">
                                    <label>Год: </label>
                                    <span className="span-year-row">
                                        <label>20</label>
                                        <input
                                            className="ticket-creator__input-smaller input-tiny font-16"
                                            value={startYear}
                                            onChange={(e) => setStartYear(e.target.value)}
                                        />
                                        <label>/20</label>
                                        <input
                                            className="ticket-creator__input-smaller input-tiny font-16"
                                            value={endYear}
                                            onChange={(e) => setEndYear(e.target.value)}
                                        />
                                    </span>

                                </div>

                            </div>

                        {/*</div>*/}

                        <div className="ticket-creator__question-header">

                            <div className="ticket-creator__row">

                                <label>
                                    Итого вопросов: <span style={{ fontWeight: 500 }}>{questionsPerType.reduce((sum, count) => sum + count, 0)}</span>
                                </label>

                            </div>

                            <div className="ticket-creator__btn-group">

                                {questionsPerType.length === 1 && (
                                    <button
                                        className="ticket-creator__double-btn upload-new-file"
                                        onClick={() => handleUploadFile(0)}
                                    >
                                        {/*<img src={`${PUBLIC_URL}/icons/toolbar_btn/upload_file.svg`}
                                             draggable={false}/>*/}<UploadIcon /> Загрузить
                                    </button>
                                )}

                                <button
                                    className="ticket-creator__double-btn add-new-ques-type"
                                    onClick={handleAddType}
                                >
                                    Добавить новый тип вопросов
                                </button>


                            </div>

                        </div>

                        {fileError && (
                            <div className="dropzone-error-message font-14">
                                {fileErrorMessage}
                            </div>
                        )}

                        <div className="ticket-creator__question-config">


                            <div className="ticket-creator__dropzone_row">


                                    {[...Array(dropAreasCount)].map((_, i) => (

                                        <div
                                            ref={(el) => zoneRefs.current[i] = el}
                                            className={`ticket-creator__dropzone-container ${i === 0 ? 'first' : ''} ${isNarrow[i] ? 'toolbar-bottom' : ''}`}
                                            key={i}
                                        >

                                            <DropZone
                                                ref={fileZoneRefs.current[i]} //у каждой дропзоны своя ссылка
                                                key={i}
                                                areaIndex={i}
                                                isInternalDragging={false}
                                                onFileUpload={(file) => handleFileUpload(file, i)}   //для файлов с компа
                                                onServerFileDrop={(fileInfo) => handleServerFileDrop(fileInfo, i)}// для файлов с родительского окна
                                                onFileError={(message) => {
                                                    setFileError(true); // флаг ошибки
                                                    setFileErrorMessage(message); // устанавливает текст сообщения
                                                    setTimeout(() => setFileError(false), 5000); // скрывает надпись через 5 сек
                                                }}
                                            >
                                                <div className="dropzone-questionsPerType">
                                                    <label className="font-14">Вопросов: </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={10}
                                                        value={questionsPerType[i]}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value, 10);
                                                            handleQuestionCountChange(i, value);
                                                        }}
                                                    />
                                                </div>
                                                <div className="file-group-toolbar">
                                                    {questionsPerType.length > 1 && (
                                                        <button
                                                            className="upload-new-file-into-one-group"
                                                            onClick={() => handleUploadFile(i)}
                                                        >
                                                            {/*<img src={`${PUBLIC_URL}/icons/toolbar_btn/upload_file.svg`} draggable={false}/>*/}
                                                            <UploadIcon />
                                                        </button>
                                                    )}
                                                    {questionsPerType.length > 1 && (
                                                        <button
                                                            className="delete-new-ques-type"
                                                            onClick={() => handleRemoveType(i)}
                                                        >
                                                            {/*<img src={`${PUBLIC_URL}/icons/toolbar_btn/Delete.svg`} draggable={false} />*/}
                                                            <DeleteIcon />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="ticket-creator__dropzone-multitype">


                                                    <div className="dropzone-file-list">


                                                        {dropZoneFiles[i]?.map((file, index) => (

                                                            <div className="dropzone-file-row" key={index}>

                                                                <img
                                                                    src={`${PUBLIC_URL}/icons/files_icons/DOCX.svg`}
                                                                    className="dropzone-file-icon"
                                                                    draggable={false} //отключаем перетягивание самой иконки
                                                                />

                                                                <span className="dropzone-file-name font-14">
                                                                    {'name' in file ? file.name : file.fileName || 'unknown'} {/*file.fileName в джсоне, file.name если реальный файл*/}
                                                                </span>

                                                                <button className="dropzone-file-remove" onClick={() => handleRemoveFile(i, index)}>
                                                                    <img src={`${PUBLIC_URL}/icons/close.svg`} draggable={false} />
                                                                </button>
                                                            </div>

                                                        ))}

                                                    </div>

                                                </div>
                                            </DropZone>





                                        </div>

                                    ))}

                            </div>

                        </div>




                        <div className="ticket-creator__column">

                            <div className="ticket-creator__row">
                                {/*<div className="ticket-creator__column label-column">
                                    <label>Зав. Кафедрой:</label>
                                    <label>Должность:</label>
                                </div>*/}
                                <div className="ticket-creator__column input-column">

                                    <div className="ticket-creator__row">

                                        <div className="input-with-clear input-medium">
                                            <label className="font-14">Преподаватель:</label>
                                            <input
                                                type="text"
                                                className="ticket-creator__input font-16"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                placeholder="Преподаватель"
                                            />
                                            {userName && (
                                                <button className="clear-button" onClick={() => setUserName("")}>
                                                    <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="input-with-clear input-medium">
                                            <label className="font-14">Зав. Кафедрой:</label>
                                            <input
                                                type="text"
                                                className="ticket-creator__input font-16"
                                                value={headOfDepartment}
                                                onChange={(e) => setHeadOfDepartment(e.target.value)}
                                                placeholder="Зав. кафедры"
                                            />
                                            {headOfDepartment && (
                                                <button className="clear-button" onClick={() => setHeadOfDepartment("")}>
                                                    <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                                </button>
                                            )}
                                        </div>

                                    </div>



                                    <div className="input-with-clear input-medium">
                                        <label className="font-14">Должность:</label>
                                        <input
                                            type="text"
                                            className="ticket-creator__input font-16"
                                            value={userPosition}
                                            onChange={(e) => setUserPosition(e.target.value)}
                                            placeholder="Должность"
                                        />
                                        {userPosition && (
                                            <button className="clear-button" onClick={() => setUserPosition("")}>
                                                <img src={`${PUBLIC_URL}/icons/close.svg`} alt="clear" width={16} height={16} />
                                            </button>
                                        )}
                                    </div>


                                    {/*<input className="ticket-creator__input input-medium font-16" defaultValue={user.position} />*/}
                                </div>

                            </div>

                            <div className="ticket-creator__generate-row ">

                                <div className="ticket-creator__date-protocol">

                                    <div className="ticket-creator__row ">
                                        <label>Дата утверждения:</label>
                                        <div className="ticket-creator__input-date">
                                            <input
                                                className="ticket-creator__input-smaller input-date-part font-16"
                                                placeholder="д"
                                                value={approvalDay}
                                                onChange={(e) => setApprovalDay(e.target.value)}
                                            />
                                            <input
                                                className="ticket-creator__input-smaller input-date-part font-16"
                                                placeholder="м"
                                                value={approvalMonth}
                                                onChange={(e) => setApprovalMonth(e.target.value)}
                                            />
                                            <input
                                                className="ticket-creator__input-smaller input-date-part font-16"
                                                placeholder="г"
                                                value={approvalYear}
                                                onChange={(e) => setApprovalYear(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="ticket-creator__row ">
                                        <label>Протокол №</label>
                                        <input
                                            className="ticket-creator__input-smaller input-protocol font-16"
                                            placeholder="?"
                                            value={ticketProtocol}
                                            onChange={(e) => {
                                                const parsed = parseInt(e.target.value, 10);
                                                if (!isNaN(parsed) && parsed >= 1) {
                                                    setTicketProtocol(parsed);
                                                } else {
                                                    setTicketProtocol(null);  //если пустое поле или что-то непонятное, количество билетов null
                                                }
                                            }}
                                        />
                                    </div>

                                </div>




                                <button className="ticket-creator__generate-btn button_st font-16" onClick={handleTicketsCreate}>
                                    {emptyInput && (<span className="generate-btn-alert font-14">{emptyInputMessage}</span>)}
                                    Сгенерировать
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="resizer resizer--right" onMouseDown={startResize({
                        direction: "right",
                        nodeRef,
                        position,
                        setPosition,
                        size,
                        setSize,
                        minW: 700,
                        maxW: 1200,
                        minH: 300,
                        maxH: 1000,
                    })} />
                    <div className="resizer resizer--bottom" onMouseDown={startResize({
                        direction: "bottom",
                        nodeRef,
                        position,
                        setPosition,
                        size,
                        setSize,
                        minW: 700,
                        maxW: 1200,
                        minH: 300,
                        maxH: 1000,
                    })} />
                    <div className="resizer resizer--left" onMouseDown={startResize({
                        direction: "left",
                        nodeRef,
                        position,
                        setPosition,
                        size,
                        setSize,
                        minW: 700,
                        maxW: 1200,
                        minH: 300,
                        maxH: 1000,
                    })} />
                    <div className="resizer resizer--top" onMouseDown={startResize({
                        direction: "top",
                        nodeRef,
                        position,
                        setPosition,
                        size,
                        setSize,
                        minW: 700,
                        maxW: 1200,
                        minH: 300,
                        maxH: 1000,
                    })} />
                </div>
            </div>
            {/*</Draggable>*/}

        </div>
    );
};

export default TicketCreator;
