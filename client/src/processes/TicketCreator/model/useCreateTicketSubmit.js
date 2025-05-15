import React, { useState } from 'react';


export const useCreateTicketSubmit = () => {
    const handleCreateTickets = async ({
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
                                       }) => {
        //console.log("EMPTY INPUT", emptyInput);
        //console.log("DROP ZONE FILES", dropZoneFiles);
        //console.log("FACULTY", faculty)
        //console.log("QUESTIONS PER TICKET", questionsPerTicket);
        //console.log("QUESTIONS PER TYPE", questionsPerType);
        //navigate('/profile');
        const count = Number(ticketCount);
        if (!ticketCount || isNaN(count) || count <= 0 || !Number.isInteger(count)) {
            errorAlert('Введите корректное количество билетов');
            return;
        }
        if (!userName || !userPosition) {
            errorAlert('Заполните ФИО, должность');
            return;
        }
        if (season === null){
            errorAlert('Укажите время года сессии');
            return;
        }
        if (!startYear || !endYear) {
            errorAlert('Укажите год сессии.');
            return;
        }
        if (!approvalDay || !approvalMonth || !approvalYear || !ticketProtocol) {
            errorAlert('Укажите дату утверждения билетов и протокол');
            return;
        }
        const hasInvalidQuestionCount = questionsPerType.some(q => !q || isNaN(q) || q <= 0 || !Number.isInteger(Number(q)));
        if (hasInvalidQuestionCount) {
            errorAlert('Введите корректное количество вопросов каждого типа');
            return;
        }
        const allZonesHaveFiles = dropZoneFiles.every(zone => zone.length > 0);
        if (!allZonesHaveFiles) {
            errorAlert('У вас есть тип вопросов без файла с вопросами.');
            return;
        }

        const payload = { // дичь
            ticketCount: count,
            fileName: ticketsFileName,
            dropZoneFiles, // массив массивов файлов каждой дропзоны
            questionsPerType, // количество вопросов каждого типа
            university,
            faculty,
            discipline,
            department,
            headOfDepartment,
            userName,
            userPosition,
            ticketProtocol,
            season,
            sessionYears: `20${startYear}/20${endYear}`,
            approvalDate: `${approvalDay.padStart(2, '0')}.${approvalMonth.padStart(2, '0')}.${approvalYear}`,
        };

        try {
            const response = await createTickets(payload); //функция в ticketApi
            console.log('Билеты успешно созданы:', response);
            navigate('/profile', { state: { activeTab: 'tickets' } });
            //alert('Билеты успешно созданы!');
        } catch (error) {
            if (error.response && error.response.status === 207) {
                const { message, errors } = error.response.data;
                console.log(message);
                console.log(errors);  // мой массив ошибок с сервера, ящик пандоры
            } else {
                console.error('Что-то пошло не так:', error.message);
            }
        }

        onClose();

    };

    return {
        handleCreateTickets,
    };



};