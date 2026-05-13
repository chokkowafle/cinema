<?php
declare(strict_types=1);

$paymentModalAmount = isset($paymentModalAmount) ? (string) $paymentModalAmount : reservation_format_money(0);
$paymentModalActionLabel = isset($paymentModalActionLabel) ? (string) $paymentModalActionLabel : 'Confirmar pago';
?>
<div class="modal fade payment-modal" id="paymentModal" tabindex="-1" aria-labelledby="payment-modal-title" aria-hidden="true" data-payment-modal>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content payment-modal-content">
            <div class="modal-header payment-modal-header">
                <div>
                    <p class="eyebrow">Pago simulado</p>
                    <h2 id="payment-modal-title">Mercado Papu</h2>
                </div>
                <img class="payment-modal-brand" src="assets/img/mercado-papu.png" alt="Mercado Papu">
                <button type="button" class="btn-close btn-close-white payment-modal-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body payment-modal-body">
                <div class="payment-modal-total">
                    <span>Total a confirmar</span>
                    <strong><?= e($paymentModalAmount) ?></strong>
                </div>

                <div class="payment-modal-grid">
                    <div class="payment-modal-field payment-modal-field-wide">
                        <label for="payment-card-number">Numero de tarjeta</label>
                        <input id="payment-card-number" type="text" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="0000 0000 0000 0000" data-payment-card-number>
                    </div>

                    <div class="payment-modal-field payment-modal-field-wide">
                        <label for="payment-card-name">Titular</label>
                        <input id="payment-card-name" type="text" autocomplete="off" maxlength="80" placeholder="Nombre en la tarjeta" data-payment-card-name>
                    </div>

                    <div class="payment-modal-field">
                        <label for="payment-card-expiry">Expiracion</label>
                        <input id="payment-card-expiry" type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="MM/AA" data-payment-card-expiry>
                    </div>

                    <div class="payment-modal-field">
                        <label for="payment-card-cvv">CVV</label>
                        <input id="payment-card-cvv" type="text" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="123" data-payment-card-cvv>
                    </div>
                </div>

                <p class="payment-modal-status" data-payment-modal-status aria-live="polite"></p>

                <button class="payment-modal-confirm" type="button" data-payment-modal-confirm>
                    <?= e($paymentModalActionLabel) ?>
                </button>
            </div>
        </div>
    </div>
</div>
