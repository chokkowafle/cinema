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

// ========== LÓGICA DE PAGO (desde Código 1) ==========
document.addEventListener("DOMContentLoaded", () => {
  // Buscar el botón de reserva (ya existe en el Código 2)
  const btnReservar = document.getElementById("btn-reservar");
  // Buscar el formulario de reserva por su clase (no tiene ID fijo en Código 2)
  const formReserva = document.querySelector(".seat-form");

  if (btnReservar) {
    btnReservar.addEventListener("click", (e) => {
      e.preventDefault();
      // Mostrar modal de pago
      const myModal = new bootstrap.Modal(document.getElementById("paymentModal"));
      myModal.show();
    });
  }

  // Lógica del botón CONFIRMAR dentro del modal
  const confirmBtn = document.getElementById("pay-confirm-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      const btn = document.getElementById("pay-confirm-btn");
      const status = document.getElementById("pay-status");

      const number = document.getElementById("pay-number").value;
      const cleanNumber = number.replace(/\s/g, "").trim();
      const name = document.getElementById("pay-name").value.trim();
      const expiry = document.getElementById("pay-expiry").value.trim();
      const cvv = document.getElementById("pay-cvv").value.trim();

      // Validaciones
      if (cleanNumber.length !== 16) {
        status.innerHTML = `<span class="text-danger">Número de tarjeta inválido</span>`;
        return;
      }
      if (name.length < 3) {
        status.innerHTML = `<span class="text-danger">Ingresa el nombre del titular</span>`;
        return;
      }
      if (expiry.length !== 5) {
        status.innerHTML = `<span class="text-danger">Fecha inválida (MM/AA)</span>`;
        return;
      }
      if (cvv.length !== 3) {
        status.innerHTML = `<span class="text-danger">CVV inválido (3 dígitos)</span>`;
        return;
      }

      const partesFecha = expiry.split("/");
      if (partesFecha.length !== 2) {
        status.innerHTML = `<span class="text-danger">El formato debe incluir la barra (MM/AA)</span>`;
        return;
      }

      const expMonth = parseInt(partesFecha[0], 10);
      const expYear = parseInt(partesFecha[1], 10) + 2000;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      if (expMonth < 1 || expMonth > 12) {
        status.innerHTML = `<span class="text-danger">Mes inválido (01-12)</span>`;
        return;
      }
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        status.innerHTML = `<span class="text-danger">Tarjeta vencida</span>`;
        return;
      }

      // SIMULACIÓN DE RECHAZOS SÍNCRONOS
      const motivosRechazo = {
        1111111111111111: "Tarjeta rechazada por el banco emisor.",
        2222222222222222: "Fondos insuficientes.",
        3333333333333333: "Tarjeta bloqueada o reportada como robada.",
      };

      if (motivosRechazo[cleanNumber]) {
        status.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill"></i> ${motivosRechazo[cleanNumber]}</span>`;
        return;
      }

      btn.disabled = true;
      const originalBtnText = btn.innerHTML;
      btn.innerHTML = "Procesando...";
      status.innerHTML = `<span class="text-secondary">Conectando con el banco...</span>`;

      setTimeout(() => {
        // SIMULACIÓN DE RECHAZO ASÍNCRONO
        if (cleanNumber === "4444444444444444") {
          status.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill"></i> Tiempo de espera agotado. Intente nuevamente.</span>`;
          btn.disabled = false;
          btn.innerHTML = originalBtnText;
          return;
        }

        // PAGO APROBADO
        status.innerHTML = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> ¡Pago aprobado! Generando reserva...</span>`;

        setTimeout(() => {
          if (formReserva) formReserva.submit();
        }, 1000);
      }, 2000);
    });
  }

  // Formateadores de campos
  const payNumber = document.getElementById("pay-number");
  if (payNumber) {
    payNumber.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    });
  }

  const payExpiry = document.getElementById("pay-expiry");
  if (payExpiry) {
    payExpiry.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").replace(/^(\d{2})/, "$1/");
    });
  }

  const payCvv = document.getElementById("pay-cvv");
  if (payCvv) {
    payCvv.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").substring(0, 3);
    });
  }
});