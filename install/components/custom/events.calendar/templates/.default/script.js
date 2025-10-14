document.addEventListener('DOMContentLoaded', function() {
    var monthSelect = document.getElementById('month');
    var yearSelect = document.getElementById('year');
    var filterMonth = monthSelect.closest('.l-calendar__filter-month');
    var filterYear = yearSelect.closest('.l-calendar__filter-year');
    var calendarEl = document.getElementById('calendar');
    var prevBtn = document.querySelector('.l-calendar__arrow-prev');
    var nextBtn = document.querySelector('.l-calendar__arrow-next');
    var headerTitle = document.getElementById('calendar-header-title');
    var monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    let modalMode = 'cards';

    monthSelect.addEventListener('focus', function() {
        filterMonth.classList.add('open');
    });
    monthSelect.addEventListener('blur', function() {
        filterMonth.classList.remove('open');
    });
    monthSelect.addEventListener('change', function() {
        filterMonth.classList.remove('open');
    });

    yearSelect.addEventListener('focus', function() {
        filterYear.classList.add('open');
    });
    yearSelect.addEventListener('blur', function() {
        filterYear.classList.remove('open');
    });
    yearSelect.addEventListener('change', function() {
        filterYear.classList.remove('open');
    });

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ru',
        firstDay: 1,
        titleFormat: {
            year: 'numeric',
            month: 'long' 
        },
        headerToolbar: {
            start: '',
            center: '',
            end: '' 
        },
        height: 'auto',
        events: window.calendarEvents || [],
    });

    calendar.render();

    updateCalendarDate();
    highlightTodayInAllYears();
    setTimeout(hideOtherMonthRows, 0);

    calendar.on('datesSet', function() {
        highlightTodayInAllYears();
        setTimeout(hideOtherMonthRows, 0);
    });

    // function updateHeaderTitle() {
    //     var date = calendar.getDate();
    //     var month = date.getMonth();
    //     var year = date.getFullYear();
    //     headerTitle.textContent = monthNames[month] + ' ' + year;
    // }

    function updateHeaderTitle() {
        var date = calendar.getDate();
        var month = date.getMonth();
        var yearValue = yearSelect.value;
        
        if (yearValue === 'Все года') {
            headerTitle.textContent = monthNames[month] + ' (Все года)';
        } else {
            headerTitle.textContent = monthNames[month] + ' ' + date.getFullYear();
        }
    }
    
    function updateCalendarDate() {
        var yearValue = yearSelect.value;
        var month = parseInt(monthSelect.value, 10) - 1;
        
        // Если выбран "Все года", показываем все события в текущем году
        if (yearValue === 'Все года') {
            var currentYear = new Date().getFullYear();
            calendar.gotoDate(new Date(currentYear, month, 1));
            
            // Модифицируем события - устанавливаем их в текущий год, но сохраняем оригинальный год в extendedProps
            var modifiedEvents = (window.calendarEvents || []).map(function(event) {
                if (!event.start) return event;
                
                var parts = event.start.split('-');
                var originalYear = parts[0];
                var month = parts[1];
                var day = parts[2];
                
                return {
                    ...event,
                    start: currentYear + '-' + month + '-' + day,
                    extendedProps: {
                        originalYear: originalYear,
                        originalStart: event.start
                    }
                };
            });
            
            calendar.setOption('events', modifiedEvents);
        } else {
            var year = parseInt(yearValue, 10);
            calendar.gotoDate(new Date(year, month, 1));
            
            // Показываем события только для выбранного года
            var filteredEvents = (window.calendarEvents || []).filter(function(event) {
                if (!event.start) return false;
                var eventYear = parseInt(event.start.split('-')[0], 10);
                return eventYear === year;
            });
            
            calendar.setOption('events', filteredEvents);
        }

        console.log(window.calendarEvents)
        
        updateHeaderTitle();
        frameIsInViewport();
    }

    function syncSelectsWithCalendar() {
        var date = calendar.getDate();
        monthSelect.value = (date.getMonth() + 1).toString();
        
        // Не меняем год в селекте если выбрано "Все года"
        if (yearSelect.value !== 'Все года') {
            yearSelect.value = date.getFullYear().toString();
        }
        
        updateHeaderTitle();
    }

    // function updateCalendarDate() {
    //     var year = parseInt(yearSelect.value, 10);
    //     var month = parseInt(monthSelect.value, 10) - 1;
    //     calendar.gotoDate(new Date(year, month, 1));
    //     updateHeaderTitle();
    //     frameIsInViewport();
    // }

    // function syncSelectsWithCalendar() {
    //     var date = calendar.getDate();
    //     monthSelect.value = (date.getMonth() + 1).toString();
    //     yearSelect.value = date.getFullYear().toString();
    //     updateHeaderTitle();
    // }

    monthSelect.addEventListener('change', function() {
        updateCalendarDate();
        animateCalendar();
        setTimeout(hideOtherMonthRows, 100);
    });
    yearSelect.addEventListener('change', function() {
        if (this.value === 'Все года') {
            // При выборе "Все года" обновляем заголовок
            var date = calendar.getDate();
            var month = date.getMonth();
            headerTitle.textContent = monthNames[month] + ' (Все года)';
        }
        updateCalendarDate();
        animateCalendar();
        setTimeout(hideOtherMonthRows, 100);
    });
    // yearSelect.addEventListener('change', function() {
    //     updateCalendarDate();
    //     animateCalendar();
    //     setTimeout(hideOtherMonthRows, 100);
    // });

    prevBtn.addEventListener('click', function() {
        calendar.prev();
        syncSelectsWithCalendar();
        animateCalendar();
        frameIsInViewport();
        setTimeout(hideOtherMonthRows, 100);
    });
    nextBtn.addEventListener('click', function() {
        calendar.next();
        syncSelectsWithCalendar();
        animateCalendar();
        frameIsInViewport();
        setTimeout(hideOtherMonthRows, 100);
    });

    function frameIsInViewport() {
        document.querySelectorAll('.fc-daygrid-day-frame').forEach(function(frame) {
            
            frame.addEventListener('click', function(e) {
                var cell = frame.closest('.fc-daygrid-day');
                if (!cell) return;

                var dateStr = cell.getAttribute('data-date');
                if (!dateStr) return;

                var parts = dateStr.split('-');
                var year = parseInt(parts[0], 10);
                var month = parseInt(parts[1], 10);
                var day = parseInt(parts[2], 10);

                var yearValue = yearSelect.value;
                var events;

                if (yearValue === 'Все года') {
                    events = getEventsByDayMonth(day, month);
                } else {
                    events = getEventsByYear(day, month, year);
                }

                if (!events.length) return;

                var currentEvent = getEventByDate(dateStr);
                if (currentEvent) {
                    showModalForDay(day, month, year, currentEvent.id, dateStr);
                } else {
                    showModalForDay(day, month, year, events[0].id, dateStr);
                }

                console.log('Clicked date:', dateStr, currentEvent, { day, month, year});
            });

        });
    }

    function animateCalendar() {
        var container = document.querySelector('.l-calendar__main');
        container.classList.remove('l-calendar-animate');
        void container.offsetWidth;
        container.classList.add('l-calendar-animate');
    }

    function hideOtherMonthRows() {
        const rows = document.querySelectorAll('.fc-daygrid-body tr');
        
        rows.forEach(row => {
            const dayCells = row.querySelectorAll('.fc-daygrid-day');
            let allOtherMonth = true;
            
            // Проверяем каждый день в строке
            dayCells.forEach(cell => {
                if (!cell.classList.contains('fc-day-other')) {
                    allOtherMonth = false;
                }
            });
            
            // Если все дни в строке из другого месяца - скрываем строку
            if (allOtherMonth) {
                row.style.display = 'none';
            } else {
                row.style.display = '';
            }
        });
    }

    // function highlightTodayInAllYears() {
    //     var today = new Date();
    //     var todayMonth = today.getMonth() + 1;
    //     var todayDay = today.getDate();

    //     var eventDates = (window.calendarEvents || []).map(function(ev) {
    //         return ev.start;
    //     });

    //     document.querySelectorAll('.fc-daygrid-day').forEach(function(cell) {
    //         var dateStr = cell.getAttribute('data-date');
    //         if (dateStr) {
    //             var parts = dateStr.split('-');
    //             var cellMonth = parseInt(parts[1], 10);
    //             var cellDay = parseInt(parts[2], 10);
    //             if (cellMonth === todayMonth && cellDay === todayDay) {
    //                 cell.classList.add('fc-day-today');
    //             } else {
    //                 cell.classList.remove('fc-day-today');
    //             }

    //             if (eventDates.includes(dateStr)) {
    //                 cell.classList.add('fc-custom-has-events');
    //             } else {
    //                 cell.classList.remove('fc-custom-has-events');
    //             }
    //         }
    //     });
    // }

    function highlightTodayInAllYears() {
        var today = new Date();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();
        var yearValue = yearSelect.value;

        var eventDates = (window.calendarEvents || []).map(function(ev) {
            return ev.start;
        });

        document.querySelectorAll('.fc-daygrid-day').forEach(function(cell) {
            var dateStr = cell.getAttribute('data-date');
            if (dateStr) {
                var parts = dateStr.split('-');
                var cellMonth = parseInt(parts[1], 10);
                var cellDay = parseInt(parts[2], 10);
                
                if (cellMonth === todayMonth && cellDay === todayDay) {
                    cell.classList.add('fc-day-today');
                } else {
                    cell.classList.remove('fc-day-today');
                }

                // В режиме "Все года" проверяем совпадение по дню и месяцу
                if (yearValue === 'Все года') {
                    var hasEvent = eventDates.some(function(eventDate) {
                        var eventParts = eventDate.split('-');
                        return parseInt(eventParts[1], 10) === cellMonth && 
                            parseInt(eventParts[2], 10) === cellDay;
                    });
                    
                    if (hasEvent) {
                        cell.classList.add('fc-custom-has-events');
                    } else {
                        cell.classList.remove('fc-custom-has-events');
                    }
                } else {
                    // В обычном режиме проверяем полное совпадение даты
                    if (eventDates.includes(dateStr)) {
                        cell.classList.add('fc-custom-has-events');
                    } else {
                        cell.classList.remove('fc-custom-has-events');
                    }
                }
            }
        });
    }

    frameIsInViewport();
    updateHeaderTitle();
    animateCalendar();

    // function getEventsByDayMonth(day, month) {
    //     return (window.calendarEvents || []).filter(function(ev) {
    //         if (!ev.start) return false;
    //         var parts = ev.start.split('-');
    //         return parseInt(parts[1], 10) === month && parseInt(parts[2], 10) === day;
    //     });
    // }

    function getEventsByDayMonth(day, month) {
        var yearValue = yearSelect.value;
        
        if (yearValue === 'Все года') {
            // В режиме "Все года" ищем события по оригинальным датам
            return (window.calendarEvents || []).filter(function(ev) {
                if (!ev.start) return false;
                var parts = ev.start.split('-');
                return parseInt(parts[1], 10) === month && parseInt(parts[2], 10) === day;
            });
        } else {
            // В обычном режиме фильтруем по году
            var year = parseInt(yearValue, 10);
            return (window.calendarEvents || []).filter(function(ev) {
                if (!ev.start) return false;
                var parts = ev.start.split('-');
                return parseInt(parts[0], 10) === year && 
                    parseInt(parts[1], 10) === month && 
                    parseInt(parts[2], 10) === day;
            });
        }
    }

    function getEventByDate(dateStr) {
        return (window.calendarEvents || []).find(function(ev) {
            return ev.start === dateStr;
        });
    }

    function getEventsByYear(day, month, year) {
        return (window.calendarEvents || []).filter(function(ev) {
            if (!ev.start) return false;
            var parts = ev.start.split('-');
            if (parts.length !== 3) return false;

            var evYear = parseInt(parts[0], 10);
            var evMonth = parseInt(parts[1], 10);
            var evDay = parseInt(parts[2], 10);

            return evYear === year && evMonth === month && evDay === day;
        });
    }

    function getEventById(id) {
        return (window.calendarEvents || []).find(function(ev) {
            return ev.id == id;
        });
    }

    function showModalForDay(day, month, year, id, dateStr) {
        var yearValue = yearSelect.value;
        var events;

        console.log('showModalForDay called with:', { day, month, year, id, dateStr, yearValue });
        
        if (yearValue === 'Все года') {
            // В режиме "Все года" используем оригинальные события
            events = getEventsByDayMonth(day, month);
        } else {
            events = getEventsByYear(day, month, year);
        }
        
        if (!events.length) return;

        window.currentDaySlides = events.map(function(ev) {
            return {
                id: ev.id,
                img: ev.image || '',
                title: ev.title || '',
                year: ev.year || '',
                date: ev.start, // Используем оригинальную дату
                description: ev.description || ''
            };
        });

        var idx = 0;
        if (id) {
            idx = window.currentDaySlides.findIndex(function(slide) {
                return slide.id == id;
            });
            if (idx === -1) {
                idx = window.currentDaySlides.findIndex(function(slide) {
                    return slide.date === dateStr;
                });
            }
            if (idx === -1) idx = 0;
        }

        openDayModal(idx);
    }

    // function showModalForDay(day, month, year, id, dateStr) {
    //     var events = getEventsByDayMonth(day, month);
    //     if (!events.length) return;

    //     window.currentDaySlides = events.map(function(ev) {
    //         return {
    //             id: ev.id,
    //             img: ev.image || '',
    //             title: ev.title || '',
    //             year: ev.year || '',
    //             date: ev.start,
    //             description: ev.description || ''
    //         };
    //     });

    //     var idx = 0;
    //     if (id) {
    //         idx = window.currentDaySlides.findIndex(function(slide) {
    //             return slide.id == id;
    //         });
    //         if (idx === -1) {
    //             idx = window.currentDaySlides.findIndex(function(slide) {
    //                 return slide.date === dateStr;
    //             });
    //         }
    //         if (idx === -1) idx = 0;
    //     }

    //     openDayModal(idx);
    // }

    function renderDaySlides() {
        slider.innerHTML = '';
        window.currentDaySlides.forEach(function(slide, idx) {
            var slideDiv = document.createElement('div');
            slideDiv.className = 'l-calendar__modal-slide' + (idx === currentSlide ? ' active' : '');
            slideDiv.style.display = idx === currentSlide ? 'flex' : 'none';
            slideDiv.innerHTML = `
                <div class="l-calendar__modal-slide-year">${slide.year ? slide.year + ' год' : ''}</div>
                <div class="l-calendar__modal-slide-date">${formatDateForModal(slide.date)}</div>
                <div class="l-calendar__modal-slide-text">${slide.description}</div>
            `;
            slider.appendChild(slideDiv);
        });

        modalImg.src = window.currentDaySlides[currentSlide].img || '';
        modalImg.style.display = window.currentDaySlides[currentSlide].img ? '' : 'none';

        updateNoImgClass();

        const prevIdx = (currentSlide - 1 + window.currentDaySlides.length) % window.currentDaySlides.length;
        const nextIdx = (currentSlide + 1) % window.currentDaySlides.length;
        prevModalBtn.querySelector('span').textContent = window.currentDaySlides[prevIdx].year || '';
        nextModalBtn.querySelector('span').textContent = window.currentDaySlides[nextIdx].year || '';

        renderDayDots();
    }

    function openDayModal(startIdx) {
        modalMode = 'day';
        currentSlide = startIdx;
        renderDaySlides();

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        animateModal();
    }

    function goToDaySlide(idx) {
        currentSlide = (idx + window.currentDaySlides.length) % window.currentDaySlides.length;
        Array.from(slider.children).forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
            slide.style.display = i === currentSlide ? 'flex' : 'none';
        });
        Array.from(dotsContainer.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        modalImg.src = window.currentDaySlides[currentSlide].img || '';
        modalImg.style.display = window.currentDaySlides[currentSlide].img ? '' : 'none';

        updateNoImgClass();

        const prevIdx = (currentSlide - 1 + window.currentDaySlides.length) % window.currentDaySlides.length;
        const nextIdx = (currentSlide + 1) % window.currentDaySlides.length;
        prevModalBtn.querySelector('span').textContent = window.currentDaySlides[prevIdx].year || '';
        nextModalBtn.querySelector('span').textContent = window.currentDaySlides[nextIdx].year || '';

        renderDaySlides();
        animateModal();
    }

    function renderDayDots() {
        dotsContainer.innerHTML = '';
        window.currentDaySlides.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'l-calendar__modal-dot' + (idx === currentSlide ? ' active' : '');
            dot.addEventListener('click', () => goToDaySlide(idx));
            dotsContainer.appendChild(dot);
        });
    }

    function formatDateForModal(dateStr) {
        var months = [
            '', 
            'января', 
            'февраля', 
            'марта', 
            'апреля', 
            'мая', 
            'июня',
            'июля', 
            'августа', 
            'сентября', 
            'октября', 
            'ноября', 
            'декабря'
        ];
        var parts = dateStr.split('-');
        if (parts.length === 3) {
            var day = parseInt(parts[2], 10);
            var month = parseInt(parts[1], 10);
            return day + ' ' + months[month];
        }
        return dateStr;
    }

    const cards = Array.from(document.querySelectorAll('.l-calendar__card'));
    const modal = document.getElementById('calendarModal');
    const modalClose = document.getElementById('calendarModalClose');
    const slider = modal.querySelector('.l-calendar__modal-slider');
    const prevModalBtn = modal.querySelector('.l-calendar__modal-prev');
    const nextModalBtn = modal.querySelector('.l-calendar__modal-next');
    const dotsContainer = modal.querySelector('.l-calendar__modal-dots');
    const modalImg = modal.querySelector('.l-calendar__modal-left img');
    const modalContent = modal.querySelector('.l-calendar__modal-content');
    let currentSlide = 0;

    const slidesData = cards.map(card => {
        const img = card.querySelector('img') ? card.querySelector('img').src : '';
        const title = card.querySelector('.l-calendar__card-title span') ? card.querySelector('.l-calendar__card-title span').textContent : '';
        const year = card.querySelector('.l-calendar__card-year span') ? card.querySelector('.l-calendar__card-year span').textContent : '';
        const date = card.querySelector('.l-calendar__card-day span') ? card.querySelector('.l-calendar__card-day span').textContent : '';
        const text = card.querySelector('.l-calendar__card-text span') ? card.querySelector('.l-calendar__card-text span').textContent : '';
        const id = card.getAttribute('data-id');
        return { img, title, year, date, text, id };
    });

    function updateNoImgClass() {
        let hasImage;
        if (modalMode === 'cards') {
            hasImage = slidesData[currentSlide].img;
        } else {
            hasImage = window.currentDaySlides[currentSlide].img;
        }
        if (hasImage) {
            modalContent.classList.remove('__no-img');
        } else {
            modalContent.classList.add('__no-img');
        }
    }

    function renderSlides() {
        slider.innerHTML = '';
        slidesData.forEach((slide, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'l-calendar__modal-slide' + (idx === currentSlide ? ' active' : '');
            slideDiv.style.display = idx === currentSlide ? 'flex' : 'none';
            slideDiv.innerHTML = `
                <div class="l-calendar__modal-slide-year">${slide.year ? slide.year + ' год' : ''}</div>
                <div class="l-calendar__modal-slide-date">${slide.date}</div>
                <div class="l-calendar__modal-slide-text">${slide.text}</div>
            `;
            slider.appendChild(slideDiv);
        });
        renderDots();

        modalImg.src = slidesData[currentSlide].img || '';
        modalImg.style.display = slidesData[currentSlide].img ? '' : 'none';

        updateNoImgClass();

        const prevIdx = (currentSlide - 1 + slidesData.length) % slidesData.length;
        const nextIdx = (currentSlide + 1) % slidesData.length;
        prevModalBtn.querySelector('span').textContent = slidesData[prevIdx].year || '';
        nextModalBtn.querySelector('span').textContent = slidesData[nextIdx].year || '';
    }

    function renderDots() {
        dotsContainer.innerHTML = '';
        slidesData.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'l-calendar__modal-dot' + (idx === currentSlide ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });
    }

    function animateModal() {
        modalContent.classList.remove('l-calendar-flash');
        void modalContent.offsetWidth;
        modalContent.classList.add('l-calendar-flash');
    }

    function goToSlide(idx) {
        currentSlide = (idx + slidesData.length) % slidesData.length;

        Array.from(slider.children).forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
            slide.style.display = i === currentSlide ? 'flex' : 'none';
        });

        Array.from(dotsContainer.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });

        modalImg.src = slidesData[currentSlide].img || '';
        modalImg.style.display = slidesData[currentSlide].img ? '' : 'none';

        updateNoImgClass();

        const prevIdx = (currentSlide - 1 + slidesData.length) % slidesData.length;
        const nextIdx = (currentSlide + 1) % slidesData.length;

        prevModalBtn.querySelector('span').textContent = slidesData[prevIdx].year || '';
        nextModalBtn.querySelector('span').textContent = slidesData[nextIdx].year || '';

        animateModal();
    }

    function showModal(idx) {
        modalMode = 'cards';
        currentSlide = idx;
        renderSlides();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        animateModal();
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        animateModal();
    }

    prevModalBtn.addEventListener('click', () => {
        if (modalMode === 'cards') {
            goToSlide(currentSlide - 1);
        } else {
            goToDaySlide(currentSlide - 1);
        }
    });
    nextModalBtn.addEventListener('click', () => {
        if (modalMode === 'cards') {
            goToSlide(currentSlide + 1);
        } else {
            goToDaySlide(currentSlide + 1);
        }
    });

    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.l-calendar__overlay').addEventListener('click', closeModal);

    cards.forEach((card, idx) => {
        card.addEventListener('click', e => {
            e.preventDefault();
            const id = card.getAttribute('data-id');
            const slideIdx = slidesData.findIndex(slide => slide.id == id);
            showModal(slideIdx !== -1 ? slideIdx : idx);
        });
    });

    let startX = null;
    slider.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener('touchend', function(e) {
        if (startX === null) return;
        let endX = e.changedTouches[0].clientX;
        if (modalMode === 'cards') {
            if (endX - startX > 50) goToSlide(currentSlide - 1);
            if (startX - endX > 50) goToSlide(currentSlide + 1);
        } else {
            if (endX - startX > 50) goToDaySlide(currentSlide - 1);
            if (startX - endX > 50) goToDaySlide(currentSlide + 1);
        }
        startX = null;
    });
});
