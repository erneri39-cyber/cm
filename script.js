document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // LÓGICA DEL ENCABEZADO (Header)
    // ===============================================
    const mainHeader = document.querySelector('.main-header');
    const navLinksForScroll = document.querySelectorAll('.main-nav a[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');

    // Efecto de encogimiento al hacer scroll
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }

    // Resaltado de enlace activo al hacer scroll
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Activa cuando la sección está en el centro de la pantalla
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksForScroll.forEach(link => link.classList.remove('active'));
                document.querySelector(`.main-nav a[href="#${id}"]`).classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // ===============================================
    // LÓGICA DE NAVEGACIÓN (Menú Hamburguesa)
    // ===============================================
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');

    if (hamburger && navMenu) {
        // Alternar la clase 'is-active' en el menú y el botón al hacer clic
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            navMenu.classList.toggle('is-active');
            // Actualizar ARIA-EXPANDED para accesibilidad
            hamburger.setAttribute('aria-expanded', navMenu.classList.contains('is-active'));
        });

        // Cierra el menú móvil al hacer clic en un enlace
        navMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return; // No se hizo clic en un enlace

            // Si es un submenú, previene el cierre y lo abre/cierra
            if (link.classList.contains('dropdown-toggle') && window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = link.parentElement;
                dropdown.classList.toggle('open');
                return; // Detiene la ejecución para no cerrar el menú principal
            }

            // Si es un enlace normal, cierra el menú principal
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('is-active')) {
                    hamburger.classList.remove('is-active');
                    navMenu.classList.remove('is-active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ===============================================
    // LÓGICA DEL CARRUSEL DE INICIO
    // ===============================================
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const slides = document.querySelectorAll('.carousel-slide');
        const dotsContainer = document.querySelector('.carousel-dots');
        const prevBtn = document.querySelector('.carousel-control.prev');
        const nextBtn = document.querySelector('.carousel-control.next');
        let currentIndex = 0;
        let intervalId = null;

        function createDots() {
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                dot.setAttribute('role', 'tab');
                // Atributos ARIA para accesibilidad de los puntos
                dot.setAttribute('aria-label', `Ir a diapositiva ${index + 1}`);
                dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
                dot.setAttribute('aria-controls', `slide-${index + 1}`);
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToSlide(index);
                    resetInterval();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots(index) {
            const dots = document.querySelectorAll('.carousel-dots .dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
                dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
            });
        }

        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            currentIndex = (index + slides.length) % slides.length;
            slides[currentIndex].classList.add('active');
            updateDots(currentIndex);
        }

        function resetInterval() {
            clearInterval(intervalId);
            intervalId = setInterval(() => goToSlide(currentIndex + 1), 7000); // Cambia cada 7 segundos
        }

        if (slides.length > 0) {
            createDots();
            prevBtn.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
                resetInterval();
            });
            nextBtn.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
                resetInterval();
            });

            // Iniciar el carrusel automático
            resetInterval();
        }
    }

    // ===============================================
    // LÓGICA PARA EL ACORDEÓN (Paneles de Imágenes)
    // ===============================================
    const accordionContainer = document.querySelector('.accordion-container');
    if (accordionContainer) {
        const panels = accordionContainer.querySelectorAll('.accordion-panel');
        let accordionInterval;
        let currentAccordionIndex = 0;

        // Detectar si es un dispositivo táctil para cambiar el evento de activación
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        function activatePanel(panelToActivate) {
            panels.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-expanded', 'false'); // Para accesibilidad
            });
            panelToActivate.classList.add('active');
            panelToActivate.setAttribute('aria-expanded', 'true'); // Para accesibilidad
            currentAccordionIndex = Array.from(panels).indexOf(panelToActivate); // Actualizar el índice actual
        }

        function nextPanel() {
            currentAccordionIndex = (currentAccordionIndex + 1) % panels.length;
            activatePanel(panels[currentAccordionIndex]);
        }

        function startAccordion() {
            // Inicia el intervalo solo si no está ya corriendo
            if (!accordionInterval) {
                accordionInterval = setInterval(nextPanel, 5000); // Cambia cada 5 segundos
            }
        }

        function stopAccordion() {
            clearInterval(accordionInterval);
            accordionInterval = null; // Resetea la variable del intervalo
        }

        // Solo activar la lógica del acordeón en dispositivos NO táctiles (escritorio)
        if (panels.length > 1 && !isTouchDevice) {
            // Inicializar atributos ARIA en los paneles
            panels.forEach((panel, index) => {
                panel.setAttribute('aria-expanded', panel.classList.contains('active') ? 'true' : 'false');
                panel.addEventListener('mouseenter', () => {
                    stopAccordion(); // Detiene el ciclo automático al interactuar
                    activatePanel(panel);
                });
            });
            accordionContainer.addEventListener('mouseenter', stopAccordion);
            accordionContainer.addEventListener('mouseleave', startAccordion);
            startAccordion(); // Inicia el acordeón dinámico
        }
    }

    // ===============================================
    // LÓGICA PARA EL LIGHTBOX DE LA GALERÍA
    // ===============================================
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightboxClose = document.querySelector('.lightbox-close');

        galleryItems.forEach(item => {
            const zoomIcon = item.querySelector('.gallery-zoom-icon');
            const image = item.querySelector('img');

            if (zoomIcon && image) {
                zoomIcon.addEventListener('click', (e) => {
                    e.preventDefault(); // Previene la navegación del enlace <a>
                    e.stopPropagation(); // Detiene la propagación del evento al enlace <a>
                    lightbox.style.display = 'flex';
                    lightboxImg.src = image.src;
                    document.body.style.overflow = 'hidden'; // Bloquea el scroll
                });
            }
        });

        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = ''; // Restaura el scroll
        }

        // Cierra el lightbox al hacer clic en el botón de cerrar o en el fondo
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // ===============================================
    // LÓGICA PARA EL MODAL DE REFLEXIÓN (Pop-up)
    // ===============================================
    
    // Obtenemos los elementos del DOM (el modal y sus partes)
    const textModal = document.getElementById('text-modal');
    
    if (textModal) {
        const modalContent = document.getElementById('modal-text-content');
        const modalCloseBtn = textModal.querySelector('.modal-close');
        // Seleccionamos TODOS los botones que abren la reflexión
        const reflectionBtns = document.querySelectorAll('.read-reflection-btn');

        // Función para cerrar el modal y RESTABLECER el scroll
        function closeTextModal() {
            textModal.style.display = 'none';
            document.body.style.overflow = ''; // Habilita el scroll
        }

        // 1. ITERAR sobre todos los botones de reflexión
        reflectionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Buscar el contenedor de la tarjeta de audio más cercano
                const audioCard = btn.closest('.audio-card');
                
                // Buscar el contenido completo de la reflexión dentro de esa tarjeta
                const fullReflectionDiv = audioCard ? audioCard.querySelector('.full-reflection') : null;

                if (fullReflectionDiv) {
                    // Inyectar el contenido HTML dinámico en el modal
                    modalContent.innerHTML = fullReflectionDiv.innerHTML;
                    
                    // Mostrar el modal (usamos 'flex' porque CSS lo tiene centrado así)
                    textModal.style.display = 'flex';
                    // Bloquear el scroll del cuerpo mientras el modal esté abierto
                    document.body.style.overflow = 'hidden'; 
                } else {
                    console.error("Error: Contenido de reflexión oculto (.full-reflection) no encontrado.");
                }
            });
        });

        // 2. Eventos de CIERRE
        
        // Cierre por botón 'x'
        modalCloseBtn.addEventListener('click', closeTextModal);

        // Cierre por clic fuera del contenido (el fondo oscuro)
        textModal.addEventListener('click', (e) => {
            if (e.target === textModal) {
                closeTextModal();
            }
        });

        // Cierre por tecla Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && textModal.style.display === 'flex') {
                closeTextModal();
            }
        });
    }
    // Fin de la lógica del modal

    // ===============================================
    // LÓGICA PARA ANIMAR NÚMEROS (CONTADOR)
    // ===============================================
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCounter(element) {
        const target = +element.dataset.target;
        const duration = 2000; // 2 segundos
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;

        const timer = setInterval(() => {
            current += 1;
            element.textContent = current;
            if (current === target) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target); // Animar solo una vez
                }
            });
        }, {
            threshold: 0.8 // Inicia cuando el 80% del elemento es visible
        });

        statNumbers.forEach(number => counterObserver.observe(number));
    }

    // ===============================================
    // LÓGICA PARA ANIMAR ELEMENTOS AL HACER SCROLL
    // ===============================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Cuando el elemento es visible
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Dejar de observar el elemento una vez que la animación se ha disparado
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // La animación se dispara cuando al menos el 10% del elemento es visible
        });

        animatedElements.forEach(element => observer.observe(element));
    }

    // ===============================================
    // LÓGICA PARA FILTROS Y BUSCADORES (AUDIOS.HTML Y EVANGELIO.HTML)
    // ===============================================
    
    // Función avanzada para múltiples filtros (texto, select, rango de fechas)
    function setupMultiFilter(config) {
        const searchElement = document.getElementById(config.searchId);
        const selectElement = config.selectId ? document.getElementById(config.selectId) : null;
        const startDateElement = config.startDateId ? document.getElementById(config.startDateId) : null;
        const endDateElement = config.endDateId ? document.getElementById(config.endDateId) : null;

        // Solo proceder si existe el buscador, que es el elemento base
        if (!searchElement) return;

        const cards = document.querySelectorAll(`${config.gridSelector} ${config.cardSelector}`);

        function applyFilters() {
            const searchTerm = searchElement.value.toLowerCase();
            const selectValue = selectElement ? selectElement.value : 'all';
            const startDateValue = startDateElement ? startDateElement.value : null;
            const endDateValue = endDateElement ? endDateElement.value : null;

            let filterStartDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null;
            let filterEndDate = endDateValue ? new Date(endDateValue + 'T23:59:59Z') : null;

            cards.forEach(card => {
                // 1. Filtro por Búsqueda de Texto
                let searchMatch = true;
                if (searchTerm) {
                    const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
                    const cardDescription = card.querySelector('p')?.textContent.toLowerCase() || '';
                    // Busca en título y descripción para ser más útil
                    searchMatch = cardTitle.includes(searchTerm) || cardDescription.includes(searchTerm);
                }

                // 2. Filtro por Select (Autor, Comunidad, etc.)
                let selectMatch = true;
                if (selectElement && config.selectAttribute) {
                    // Lógica especial para el filtro de comunidad en audios.html
                    if (config.selectId === 'comunidad-filter') {
                        const cardSelectAttribute = card.dataset.community;
                        selectMatch = (selectValue === 'all' || cardSelectAttribute === selectValue);
                    }
                    const cardSelectAttribute = card.dataset[config.selectAttribute];
                    selectMatch = (selectValue === 'all' || cardSelectAttribute === selectValue);
                }

                // 3. Filtro por Rango de Fechas
                let dateMatch = true;
                if (startDateElement && endDateElement && config.dateAttribute) {
                    const cardDateStr = card.dataset[config.dateAttribute]; // Espera YYYY-MM o YYYY-MM-DD
                    if (cardDateStr) {
                        // Lógica para manejar YYYY-MM (videocatequesis) y YYYY-MM-DD (evangelio, caravanas)
                        if (cardDateStr.length === 7) { // Formato YYYY-MM
                            const cardMonthStart = new Date(cardDateStr + '-01T00:00:00Z');
                            const cardMonthEnd = new Date(cardMonthStart.getUTCFullYear(), cardMonthStart.getUTCMonth() + 1, 0);
                            cardMonthEnd.setUTCHours(23, 59, 59, 999);

                            dateMatch = (!filterStartDate || cardMonthEnd >= filterStartDate) &&
                                        (!filterEndDate || cardMonthStart <= filterEndDate);
                        } else { // Formato YYYY-MM-DD
                            const cardDate = new Date(cardDateStr + 'T12:00:00Z');
                            
                            if (filterStartDate && filterEndDate) {
                                dateMatch = (cardDate >= filterStartDate && cardDate <= filterEndDate);
                            } else if (filterStartDate) {
                                dateMatch = (cardDate >= filterStartDate);
                            } else if (filterEndDate) {
                                dateMatch = (cardDate <= filterEndDate);
                            }
                        }

                    } else {
                        // Si la tarjeta no tiene fecha, no coincide si hay un filtro de fecha activo
                        dateMatch = !(filterStartDate || filterEndDate);
                    }
                }

                // Mostrar la tarjeta solo si TODOS los filtros coinciden
                if (searchMatch && selectMatch && dateMatch) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Añadir listeners a todos los elementos de filtro que existan
        searchElement.addEventListener('input', applyFilters);
        if (selectElement) selectElement.addEventListener('change', applyFilters);
        if (startDateElement) startDateElement.addEventListener('change', applyFilters);
        if (endDateElement) endDateElement.addEventListener('change', applyFilters);

        applyFilters(); // Ejecutar al cargar
    }

    // Configurar para la página de Evangelio
    setupMultiFilter({
        gridSelector: '#evangelio-del-dia', 
        cardSelector: '.audio-card',
        searchId: 'evangelio-search',
        startDateId: 'start-date-filter-evangelio', endDateId: 'end-date-filter-evangelio', dateAttribute: 'date'
    });

    // Configurar para la página de Audios
    setupMultiFilter({
        gridSelector: '#galeria-audios', cardSelector: '.audio-card',
        searchId: 'audio-search', selectId: 'comunidad-filter', selectAttribute: 'community'
    });

    // Configurar para la página de Videocatequesis
    setupMultiFilter({
        gridSelector: '#galeria-videos', cardSelector: '.video-card', searchId: 'video-search',
        startDateId: 'start-date-filter', endDateId: 'end-date-filter', dateAttribute: 'date'
    });

    // ===============================================
    // LÓGICA DE PAGINACIÓN GENÉRICA
    // ===============================================
    function setupPagination(gridSelector, cardSelector, itemsPerPage) {
        const paginationContainer = document.getElementById('pagination-container');
        const grid = document.querySelector(gridSelector);

        if (!paginationContainer || !grid) return;

        let currentPage = 1;

        function displayPage(cards, page) {
            currentPage = page;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            // Ocultar todas las tarjetas primero
            grid.querySelectorAll(cardSelector).forEach(card => card.style.display = 'none');

            // Mostrar solo las tarjetas para la página actual
            cards.slice(startIndex, endIndex).forEach(card => card.style.display = '');

            updatePaginationButtons(cards.length);
        }

        function updatePaginationButtons(totalItems) {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            if (totalPages <= 1) return;

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.classList.add('pagination-btn');
                if (i === currentPage) {
                    btn.classList.add('active');
                }
                btn.addEventListener('click', () => {
                    const visibleCards = Array.from(grid.querySelectorAll(cardSelector)).filter(card => card.dataset.isMatch === 'true');
                    displayPage(visibleCards, i);
                });
                paginationContainer.appendChild(btn);
            }
        }

        // Esta función será llamada desde el filtro para actualizar la paginación
        function update(visibleCards) {
            // Marcar las tarjetas visibles para que la paginación sepa cuáles son
            grid.querySelectorAll(cardSelector).forEach(card => {
                card.dataset.isMatch = visibleCards.includes(card) ? 'true' : 'false';
            });
            displayPage(visibleCards, 1); // Volver a la página 1 en cada nuevo filtro
        }

        // Inicialización: mostrar la primera página con todas las tarjetas
        const allCards = Array.from(grid.querySelectorAll(cardSelector));
        update(allCards);

        // Devolver la función de actualización para que los filtros puedan usarla
        return { update };
    }

    // Configurar para la página de Oraciones (búsqueda por título y descripción)
    function setupOracionesSearch() {
        const searchElement = document.getElementById('oraciones-search');
        if (!searchElement) return;

        const cards = document.querySelectorAll('#galeria-oraciones .audio-card');

        // Inicializar la paginación para la sección de oraciones
        const pagination = setupPagination('#galeria-oraciones .audio-grid', '.audio-card', 6); // 6 oraciones por página

        function filterOraciones() {
            const searchTerm = searchElement.value.toLowerCase();
            const visibleCards = [];

            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                const isMatch = title.includes(searchTerm) || description.includes(searchTerm);
                if (isMatch) {
                    visibleCards.push(card);
                }
            });
            pagination.update(visibleCards);
        }

        searchElement.addEventListener('input', filterOraciones);
    }
    setupOracionesSearch();

    // Configurar para la página de Caravanas (búsqueda y filtro de fecha)
    function setupCaravanasFilter() {
        const searchElement = document.getElementById('caravana-search');
        const startDateElement = document.getElementById('start-date-filter-caravana');
        const endDateElement = document.getElementById('end-date-filter-caravana');

        if (!searchElement || !startDateElement || !endDateElement) return;

        const cards = document.querySelectorAll('#todas-las-caravanas .caravana-card');
        const pagination = setupPagination('#todas-las-caravanas .caravanas-grid', '.caravana-card', 4); // 4 caravanas por página

        function applyFilters() {
            const searchTerm = searchElement.value.toLowerCase();
            const startDateValue = startDateElement.value;
            const endDateValue = endDateElement.value;

            let filterStartDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null;
            let filterEndDate = endDateValue ? new Date(endDateValue + 'T23:59:59Z') : null;

            const visibleCards = [];

            cards.forEach(card => {
                // 1. Filtro por Búsqueda (título y lugar)
                const title = card.querySelector('h3').textContent.toLowerCase();
                const location = card.querySelector('.fa-map-marker-alt').parentElement.textContent.toLowerCase();
                const searchMatch = title.includes(searchTerm) || location.includes(searchTerm);

                // 2. Filtro por Rango de Fechas
                let dateMatch = true;
                const cardDateStr = card.dataset.date; // Espera YYYY-MM-DD
                if (cardDateStr) {
                    const cardDate = new Date(cardDateStr + 'T12:00:00Z');
                    if (filterStartDate && cardDate < filterStartDate) {
                        dateMatch = false;
                    }
                    if (filterEndDate && cardDate > filterEndDate) {
                        dateMatch = false;
                    }
                } else if (filterStartDate || filterEndDate) {
                    dateMatch = false; // No mostrar si no tiene fecha y se está filtrando por fecha
                }

                if (searchMatch && dateMatch) {
                    visibleCards.push(card);
                }
            });
            pagination.update(visibleCards);
        }

        [searchElement, startDateElement, endDateElement].forEach(el => el.addEventListener('input', applyFilters));
    }
    setupCaravanasFilter();

    // Configurar para la página de Obras de Misericordia
    function setupObrasFilter() {
        const grid = document.querySelector('#todas-las-obras .obras-grid');
        if (!grid) return;
        const cards = Array.from(grid.querySelectorAll('.obra-card'));
        const pagination = setupPagination('#todas-las-obras .obras-grid', '.obra-card', 6); // 6 obras por página
        if (pagination) {
            pagination.update(cards);
        }
    }
    setupObrasFilter();

    // Configurar para la página de Proyectos de la Fundación
    function setupProyectosFilter() {
        const grid = document.querySelector('#proyectos-fundacion .proyecto-grid');
        if (!grid) return;
        const cards = Array.from(grid.querySelectorAll('.proyecto-card'));
        const pagination = setupPagination('#proyectos-fundacion .proyecto-grid', '.proyecto-card', 6); // 6 proyectos por página
        if (pagination) {
            pagination.update(cards);
        }
    }
    setupProyectosFilter();



    // ===============================================
    // LÓGICA PARA REPRODUCTORES DE AUDIO (Pausar otros al reproducir)
    // ===============================================
    function setupExclusiveAudioPlayback() {
        const audioPlayers = document.querySelectorAll('audio');

        if (audioPlayers.length === 0) {
            return;
        }

        // Función para quitar la clase de resaltado de todas las tarjetas de audio
        function removePlayingClassFromAll() {
            document.querySelectorAll('.audio-card.is-playing').forEach(card => {
                card.classList.remove('is-playing');
            });
        }

        audioPlayers.forEach(player => {
            const card = player.closest('.audio-card');
            if (!card) return;

            player.addEventListener('play', () => {
                // 1. Quitar el resaltado de cualquier otra tarjeta
                removePlayingClassFromAll();
                // 2. Resaltar la tarjeta actual
                card.classList.add('is-playing');
                // 3. Pausar todos los demás audios
                audioPlayers.forEach(otherPlayer => {
                    if (otherPlayer !== player) {
                        otherPlayer.pause();
                    }
                });
            });

            // Quitar el resaltado cuando el audio se pausa o termina
            player.addEventListener('pause', () => card.classList.remove('is-playing'));
            player.addEventListener('ended', () => card.classList.remove('is-playing'));
        });
    }

    // Llamar a la función para que se active en las páginas que tengan audios.
    setupExclusiveAudioPlayback();

    // ===============================================
    // LÓGICA DE VALIDACIÓN DEL FORMULARIO DE CONTACTO
    // ===============================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const formStatusMessage = document.getElementById('form-status-message');

        // Función para mostrar un error en un campo específico
        const showError = (input, message) => {
            const formGroup = input.parentElement;
            const errorDisplay = formGroup.querySelector('.error-message');
            
            input.classList.add('has-error');
            errorDisplay.textContent = message;
            errorDisplay.classList.add('active');
        };

        // Función para limpiar el error de un campo
        const clearError = (input) => {
            const formGroup = input.parentElement;
            const errorDisplay = formGroup.querySelector('.error-message');

            input.classList.remove('has-error');
            errorDisplay.textContent = '';
            errorDisplay.classList.remove('active');
        };

        // Función para validar el formato del email
        const isValidEmail = (email) => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevenir el envío real del formulario

            let isValid = true;
            const inputs = contactForm.querySelectorAll('input[required], textarea[required]');

            // Limpiar errores previos y mensajes de estado
            inputs.forEach(input => clearError(input));
            formStatusMessage.style.display = 'none';
            formStatusMessage.className = '';

            // Validar cada campo requerido
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'Este campo es obligatorio.');
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Por favor, introduce un correo electrónico válido.');
                }
            });

            if (isValid) {
                // Simulación de envío exitoso
                console.log('Formulario válido, enviando...');
                
                // Mostrar mensaje de éxito
                formStatusMessage.textContent = '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.';
                formStatusMessage.classList.add('success');
                formStatusMessage.style.display = 'block';

                // Limpiar el formulario
                contactForm.reset();

                // Ocultar el mensaje de éxito después de 5 segundos
                setTimeout(() => {
                    formStatusMessage.style.display = 'none';
                }, 5000);

            } else {
                // Mostrar mensaje de error general
                formStatusMessage.textContent = 'Por favor, corrige los errores en el formulario.';
                formStatusMessage.classList.add('error');
                formStatusMessage.style.display = 'block';
                console.log('El formulario contiene errores.');
            }
        });
    }


    // ===============================================
    // LÓGICA PARA EL BOTÓN "VOLVER ARRIBA"
    // ===============================================
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            // Muestra el botón si el usuario ha bajado más de 300px
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===============================================
    // LÓGICA PARA MÚSICA DE FONDO (User-controlled)
    // ===============================================
    const backgroundMusic = document.getElementById('background-music');
    // Creamos el botón de control de música dinámicamente
    const toggleMusicBtn = document.createElement('button');
    toggleMusicBtn.id = 'toggle-music-btn';
    toggleMusicBtn.classList.add('music-control-btn');
    toggleMusicBtn.setAttribute('aria-label', 'Reproducir o pausar música de fondo');
    document.body.appendChild(toggleMusicBtn);

    if (backgroundMusic && toggleMusicBtn) {
        // Intentar reproducir de forma silenciosa al cargar.
        // Los navegadores modernos suelen permitir autoplay si está muteado.
        backgroundMusic.muted = true;
        backgroundMusic.volume = 0.5; // Establecer un volumen por defecto (si se desmutea)

        backgroundMusic.play().then(() => {
            // Autoplay exitoso (probablemente porque estaba muteado)
            toggleMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Muestra icono de mudo
        }).catch(error => {
            // Autoplay bloqueado (incluso muteado, o si no se permite)
            console.warn("Autoplay de música bloqueado. El usuario debe iniciar la reproducción.", error);
            toggleMusicBtn.innerHTML = '<i class="fas fa-volume-off"></i>'; // Muestra icono de pausado
            backgroundMusic.muted = false; // Asegurarse de que no esté mudo si el usuario lo va a iniciar
            backgroundMusic.pause(); // Asegurarse de que esté pausado
        });

        toggleMusicBtn.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                // Si está pausado, intentar reproducir y quitar el mudo si lo estaba
                backgroundMusic.muted = false;
                backgroundMusic.play().then(() => {
                    toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; // Icono de sonido
                }).catch(error => {
                    console.error("Error al intentar reproducir la música:", error);
                    toggleMusicBtn.innerHTML = '<i class="fas fa-volume-off"></i>';
                    backgroundMusic.muted = true; // Volver a mutear si no se pudo reproducir
                });
            } else if (backgroundMusic.muted) {
                // Si está reproduciendo pero mudo, desmutear
                backgroundMusic.muted = false;
                toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; // Icono de sonido
            } else {
                // Si está reproduciendo y no mudo, mutear
                backgroundMusic.muted = true;
                toggleMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Icono de mudo
            }
        });

        // Actualizar el icono si el usuario interactúa con los controles nativos (si se muestran)
        backgroundMusic.addEventListener('volumechange', () => {
            if (backgroundMusic.paused) {
                toggleMusicBtn.innerHTML = '<i class="fas fa-volume-off"></i>';
            } else if (backgroundMusic.muted) {
                toggleMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });
    }
});