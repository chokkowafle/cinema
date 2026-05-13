document.documentElement.dataset.appReady = 'true';

function initCarteleraFilterForms() {
    document.querySelectorAll('[data-filter-form]').forEach((form) => {
        if (form.dataset.filterBound === 'true') {
            return;
        }

        form.dataset.filterBound = 'true';

        const searches = Array.from(form.querySelectorAll('input[type="search"]'));
        let searchSubmitTimer = null;

        const scheduleSubmit = (delay = 0) => {
            window.clearTimeout(searchSubmitTimer);
            searchSubmitTimer = window.setTimeout(() => {
                form.submit();
            }, delay);
        };

        form.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener('change', () => {
                scheduleSubmit(0);
            });
        });

        form.querySelectorAll('select').forEach((select) => {
            select.addEventListener('change', () => {
                scheduleSubmit(0);
            });
        });

        form.querySelectorAll('input[type="date"]').forEach((input) => {
            input.addEventListener('change', () => {
                scheduleSubmit(0);
            });
        });

        searches.forEach((search) => {
            search.addEventListener('input', () => {
                scheduleSubmit(350);
            });

            search.addEventListener('keyup', () => {
                scheduleSubmit(350);
            });

            search.addEventListener('change', () => {
                scheduleSubmit(0);
            });

            search.addEventListener('search', () => {
                scheduleSubmit(0);
            });

            search.addEventListener('paste', () => {
                window.setTimeout(() => {
                    scheduleSubmit(350);
                }, 0);
            });
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarteleraFilterForms);
} else {
    initCarteleraFilterForms();
}

document.querySelectorAll('[data-movie-detail]').forEach((detail) => {
    const tabs = Array.from(detail.querySelectorAll('[data-movie-date-tab]'));
    const panels = Array.from(detail.querySelectorAll('[data-movie-date-panel]'));

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.movieDateTab;

            tabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.movieDatePanel === target;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        });
    });
});

document.querySelectorAll('[data-ticket-selector]').forEach((selector) => {
    const count = selector.querySelector('[data-ticket-count]');
    const decrease = selector.querySelector('[data-ticket-action="decrease"]');
    const increase = selector.querySelector('[data-ticket-action="increase"]');
    const min = Number.parseInt(selector.dataset.min || '0', 10);
    const max = Number.parseInt(selector.dataset.max || '10', 10);

    if (count === null || decrease === null || increase === null) {
        return;
    }

    const readValue = () => Number.parseInt(count.value || count.textContent || '0', 10);
    const writeValue = (value) => {
        const normalized = Math.min(Math.max(value, min), max);
        count.value = String(normalized);
        count.textContent = String(normalized);
        selector.classList.toggle('is-selected', normalized > 0);
        selector.dispatchEvent(new CustomEvent('ticket-count-change', { bubbles: true }));
    };

    decrease.addEventListener('click', () => {
        writeValue(readValue() - 1);
    });

    increase.addEventListener('click', () => {
        writeValue(readValue() + 1);
    });

    writeValue(readValue());
});

document.querySelectorAll('[data-showtime-form]').forEach((form) => {
    const showtimeInput = form.querySelector('[data-selected-showtime]');
    const ticketInput = form.querySelector('[data-ticket-total]');
    const continueButton = form.querySelector('[data-visual-continue]');
    const choices = Array.from(form.querySelectorAll('[data-showtime-choice]'));
    const maxTickets = 10;

    if (showtimeInput === null || ticketInput === null || continueButton === null) {
        return;
    }

    const readTicketTotal = () => Array.from(form.querySelectorAll('[data-ticket-count]'))
        .reduce((total, item) => total + Number.parseInt(item.value || item.textContent || '0', 10), 0);

    const updateContinueState = () => {
        const ticketTotal = readTicketTotal();
        const hasShowtime = showtimeInput.value !== '';
        const canContinue = hasShowtime && ticketTotal > 0 && ticketTotal <= maxTickets;

        ticketInput.value = String(ticketTotal);
        continueButton.disabled = !canContinue;
        continueButton.setAttribute('aria-disabled', canContinue ? 'false' : 'true');
    };

    choices.forEach((choice) => {
        choice.addEventListener('click', () => {
            if (choice.disabled || choice.dataset.showtimeSoldOut === 'true') {
                return;
            }

            const selectedShowtime = choice.dataset.showtimeChoice || '';

            showtimeInput.value = selectedShowtime;

            choices.forEach((item) => {
                item.classList.toggle('is-selected', item === choice);
            });

            updateContinueState();
        });
    });

    form.addEventListener('ticket-count-change', updateContinueState);
    form.addEventListener('submit', (event) => {
        updateContinueState();

        if (continueButton.disabled) {
            event.preventDefault();
        }
    });

    updateContinueState();
});

document.querySelectorAll('[data-seat-form]').forEach((form) => {
    const ticketCount = Number.parseInt(form.dataset.ticketCount || '0', 10);
    const ticketTotal = form.dataset.ticketTotal || '';
    const checkboxes = Array.from(form.querySelectorAll('[data-seat-checkbox]'));
    const selectedCount = form.querySelector('[data-seat-selected-count]');
    const selectedList = form.querySelector('[data-seat-selected-list]');
    const remainingText = form.querySelector('[data-seat-remaining]');
    const currentTotal = form.querySelector('[data-seat-current-total]');
    const submitGuard = form.querySelector('[data-seat-submit-guard]');
    const submitButton = form.querySelector('[data-seat-submit]');
    const submitState = form.querySelector('[data-seat-submit-state]');
    const submitMessage = form.querySelector('[data-seat-submit-message]');

    if (ticketCount <= 0 || selectedCount === null || selectedList === null || submitButton === null) {
        return;
    }

    let hasSubmitAttempt = false;

    const seatLabelFor = (checkbox) => checkbox.value.replace('-', '');
    const seatWord = (amount) => amount === 1 ? 'butaca' : 'butacas';
    const selectionBalanceLabel = (selectedAmount) => {
        const remaining = ticketCount - selectedAmount;

        if (remaining === 0) {
            return 'No faltan butacas';
        }

        if (remaining < 0) {
            const extra = Math.abs(remaining);
            return `Quita ${extra} ${seatWord(extra)}`;
        }

        return `${remaining === 1 ? 'Falta' : 'Faltan'} ${remaining} ${seatWord(remaining)}`;
    };

    const updateSeatState = () => {
        const selected = checkboxes.filter((checkbox) => checkbox.checked);
        const selectedLabels = selected.map(seatLabelFor);
        const remainingSeatLabel = selectionBalanceLabel(selected.length);
        const hasExactSelection = selected.length === ticketCount;

        checkboxes.forEach((checkbox) => {
            const seat = checkbox.closest('.seat-cell');
            const isOccupied = seat !== null && seat.classList.contains('is-occupied');

            if (seat !== null) {
                seat.classList.toggle('is-selected', checkbox.checked && !isOccupied);
            }

            if (!isOccupied && !checkbox.checked) {
                checkbox.disabled = selected.length >= ticketCount;
            }
        });

        selectedCount.textContent = String(selected.length);
        selectedList.textContent = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Sin butacas seleccionadas';

        if (remainingText !== null) {
            remainingText.textContent = remainingSeatLabel;
        }

        if (currentTotal !== null && ticketTotal !== '') {
            currentTotal.textContent = ticketTotal;
        }

        submitButton.disabled = !hasExactSelection;
        submitButton.setAttribute('aria-disabled', hasExactSelection ? 'false' : 'true');

        if (submitGuard !== null) {
            submitGuard.classList.toggle('is-disabled', !hasExactSelection);
        }

        if (submitState !== null) {
            submitState.textContent = hasExactSelection
                ? 'Boton activo'
                : `Boton deshabilitado: ${remainingSeatLabel.toLowerCase()}`;
        }

        if (submitMessage !== null) {
            submitMessage.textContent = hasExactSelection
                ? ''
                : `Selecciona ${ticketCount} ${seatWord(ticketCount)} para reservar. ${remainingSeatLabel}.`;
            submitMessage.hidden = hasExactSelection || !hasSubmitAttempt;
        }
    };

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateSeatState);
    });

    form.addEventListener('submit', (event) => {
        hasSubmitAttempt = true;
        updateSeatState();

        if (submitButton.disabled) {
            event.preventDefault();
        }
    });

    if (submitGuard !== null) {
        submitGuard.addEventListener('click', (event) => {
            if (!submitButton.disabled) {
                return;
            }

            event.preventDefault();
            hasSubmitAttempt = true;
            updateSeatState();
        });
    }

    updateSeatState();
});

document.querySelectorAll('[data-cancel-reservation]').forEach((form) => {
    form.addEventListener('submit', (event) => {
        if (!window.confirm('Cancelar esta reserva?')) {
            event.preventDefault();
        }
    });
});

document.querySelectorAll('[data-print-ticket]').forEach((button) => {
    button.addEventListener('click', () => {
        window.print();
    });
});

document.querySelectorAll('[data-confirm-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
        const message = button.dataset.confirmAction || 'Confirmar accion?';

        if (!window.confirm(message)) {
            event.preventDefault();
        }
    });
});

function initPaymentModal() {
    const modalElement = document.querySelector('[data-payment-modal]');
    const forms = Array.from(document.querySelectorAll('[data-payment-modal-form]'));

    if (modalElement === null || forms.length === 0 || typeof bootstrap === 'undefined') {
        return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const confirmButton = modalElement.querySelector('[data-payment-modal-confirm]');
    const status = modalElement.querySelector('[data-payment-modal-status]');
    const numberInput = modalElement.querySelector('[data-payment-card-number]');
    const nameInput = modalElement.querySelector('[data-payment-card-name]');
    const expiryInput = modalElement.querySelector('[data-payment-card-expiry]');
    const cvvInput = modalElement.querySelector('[data-payment-card-cvv]');
    const inputs = [numberInput, nameInput, expiryInput, cvvInput].filter((input) => input !== null);
    const originalButtonText = confirmButton !== null ? confirmButton.textContent.trim() : '';
    let activeForm = null;

    if (confirmButton === null || status === null || numberInput === null || nameInput === null || expiryInput === null || cvvInput === null) {
        return;
    }

    const setStatus = (message, type = '') => {
        status.textContent = message;
        status.classList.toggle('is-error', type === 'error');
        status.classList.toggle('is-success', type === 'success');
        status.classList.toggle('is-muted', type === 'muted');
    };

    const resetModal = () => {
        inputs.forEach((input) => {
            input.value = '';
        });
        confirmButton.disabled = false;
        confirmButton.textContent = originalButtonText;
        setStatus('', '');
    };

    const cardNumber = () => numberInput.value.replace(/\D/g, '');

    const validateExpiry = () => {
        const match = expiryInput.value.match(/^(\d{2})\/(\d{2})$/);

        if (match === null) {
            return 'Usa formato MM/AA.';
        }

        const month = Number.parseInt(match[1], 10);
        const year = Number.parseInt(match[2], 10) + 2000;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (month < 1 || month > 12) {
            return 'El mes debe estar entre 01 y 12.';
        }

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return 'La tarjeta de prueba esta vencida.';
        }

        return '';
    };

    const validatePayment = () => {
        if (cardNumber().length !== 16) {
            return 'Ingresa un numero de tarjeta de 16 digitos.';
        }

        if (nameInput.value.trim().length < 3) {
            return 'Ingresa el nombre del titular.';
        }

        const expiryError = validateExpiry();

        if (expiryError !== '') {
            return expiryError;
        }

        if (cvvInput.value.replace(/\D/g, '').length !== 3) {
            return 'Ingresa un CVV de 3 digitos.';
        }

        return '';
    };

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            if (form.dataset.paymentModalConfirmed === 'true') {
                delete form.dataset.paymentModalConfirmed;
                return;
            }

            event.preventDefault();
            activeForm = form;
            resetModal();
            modal.show();
        });
    });

    modalElement.addEventListener('shown.bs.modal', () => {
        numberInput.focus();
    });

    numberInput.addEventListener('input', () => {
        numberInput.value = cardNumber().replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    });

    expiryInput.addEventListener('input', () => {
        const value = expiryInput.value.replace(/\D/g, '').slice(0, 4);
        expiryInput.value = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
    });

    cvvInput.addEventListener('input', () => {
        cvvInput.value = cvvInput.value.replace(/\D/g, '').slice(0, 3);
    });

    confirmButton.addEventListener('click', () => {
        const validationError = validatePayment();
        const rejectedCards = {
            1111111111111111: 'Tarjeta rechazada por el banco emisor.',
            2222222222222222: 'Fondos insuficientes.',
            3333333333333333: 'Tarjeta bloqueada.',
            4444444444444444: 'Tiempo de espera agotado. Intenta nuevamente.',
        };
        const cleanNumber = cardNumber();

        if (validationError !== '') {
            setStatus(validationError, 'error');
            return;
        }

        if (Object.prototype.hasOwnProperty.call(rejectedCards, cleanNumber)) {
            setStatus(rejectedCards[cleanNumber], 'error');
            return;
        }

        confirmButton.disabled = true;
        confirmButton.textContent = 'Procesando...';
        setStatus('Validando pago simulado...', 'muted');

        window.setTimeout(() => {
            setStatus('Pago aprobado. Confirmando...', 'success');

            window.setTimeout(() => {
                if (activeForm === null) {
                    return;
                }

                activeForm.dataset.paymentModalConfirmed = 'true';

                if (typeof activeForm.requestSubmit === 'function') {
                    activeForm.requestSubmit();
                    return;
                }

                activeForm.submit();
            }, 700);
        }, 900);
    });
}

initPaymentModal();
