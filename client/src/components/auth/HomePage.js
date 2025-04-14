import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import '../../styles/global.css';
const API_URL = process.env.REACT_APP_API_URL;

const HomePage = () => {

    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div className="container">

            <img src="/icons/home_page/logo.svg" alt="Логотип" className="homepage__logo" />

            <div className="homepage__container">

                <div className="homepage-welcome">
                    <main className="homepage__content">
                        <div className="homepage__text-block">
                            <h1 className="homepage__title font-48">
                                Создай свои билеты
                            </h1>

                            <p className="homepage__description font-16">
                                Дипломная работа студента БНТУ 4 курса, призванная помочь преподавателям автоматизировать и ускорить создание новых билетов на основе их вопросов.
                            </p>

                            <button
                                type="button"
                                className="homepage__button button_st font-20"
                                onClick={handleStart}
                            >
                                Начать работу
                            </button>
                        </div>

                        <p className="homepage__auth font-16">
                            <a href="/login">Войдите</a> или <a href="/register">зарегистрируйтесь</a>
                        </p>
                    </main>

                    <aside className="homepage__aside">

                        <div className="homepage__steps">
                                <div className="step step--left">
                                    <div className="step__content">
                                        <div className="step__text">
                                            <p className="step__small-text font-20">Загрузи список вопросов</p>
                                            <p className="step__big-text font-40">Загружай</p>
                                        </div>
                                        <img src="/icons/DOCX.svg" alt="Иконка 1" className="step__icon" />
                                    </div>
                                </div>

                                <div className="step step--center">
                                    <div className="step__content">
                                        <div className="step__text">
                                            <p className="step__small-text font-20">Создай набор билетов</p>
                                            <p className="step__big-text font-40">Создавай</p>
                                        </div>
                                        <img src="/icons/home_page/DOCX_.svg" alt="Иконка 2" className="step__icon" />
                                    </div>
                                </div>

                                <div className="step step--right">
                                    <div className="step__content">
                                        <div className="step__text">
                                            <p className="step__small-text font-20">Храни его прямо тут!</p>
                                            <p className="step__big-text font-40">Сохраняй</p>
                                        </div>
                                        <img src="/icons/home_page/saveToDisk.svg" alt="Иконка 3" className="step__icon" />
                                    </div>
                                </div>
                        </div>
                    </aside>
                </div>
            </div>

        </div>

    );


};

export default HomePage;
