<?php
declare(strict_types=1);

$checkoutType = (string) ($checkout['type'] ?? '');
$activeNav = (string) ($checkout['active_nav'] ?? '');
$pageTitle = (string) ($checkout['title'] ?? 'Confirmar pago');
$heading = (string) ($checkout['heading'] ?? 'Confirma tu compra');
$eyebrow = (string) ($checkout['eyebrow'] ?? 'Pago de prueba');
$lead = (string) ($checkout['lead'] ?? '');
$summaryTitle = (string) ($checkout['summary_title'] ?? 'Resumen');
$totalLabel = (string) ($checkout['total_label'] ?? reservation_format_money(0));
$pricing = is_array($checkout['pricing'] ?? null) ? $checkout['pricing'] : [];
$subtotalLabel = (string) ($pricing['subtotal_label'] ?? reservation_format_money(0));
$discountLabel = (string) ($pricing['discount_label'] ?? reservation_format_money(0));
$totalFinalLabel = (string) ($pricing['total_label'] ?? $totalLabel);
$couponApplied = ($pricing['applied'] ?? false) === true;
$couponCode = (string) ($pricing['code'] ?? '');
$couponLabel = (string) ($pricing['label'] ?? '');
$couponPercentLabel = (string) ($pricing['percent_label'] ?? '');
$returnUrl = (string) ($checkout['return_url'] ?? 'index.php?page=cartelera');
$canConfirm = ($checkout['can_confirm'] ?? false) === true;
$confirmFields = is_array($checkout['confirm_fields'] ?? null) ? $checkout['confirm_fields'] : ['type' => $checkoutType];
$couponFields = is_array($checkout['coupon_fields'] ?? null) ? $checkout['coupon_fields'] : $confirmFields;
$reservation = is_array($checkout['reservation'] ?? null) ? $checkout['reservation'] : null;
$showtimeLabels = is_array($checkout['showtime_labels'] ?? null) ? $checkout['showtime_labels'] : ['datetime' => '', 'date' => '', 'time' => ''];
$cartSummary = is_array($checkout['cart_summary'] ?? null) ? $checkout['cart_summary'] : ['items' => [], 'total_label' => reservation_format_money(0)];
$cartItems = is_array($cartSummary['items'] ?? null) ? $cartSummary['items'] : [];
$cartLoadError = ($checkout['cart_load_error'] ?? false) === true;
$catalogSetupRequired = ($checkout['catalog_setup_required'] ?? false) === true;
$lastReceipt = is_array($checkout['last_receipt'] ?? null) ? $checkout['last_receipt'] : null;
$membershipPlan = is_array($checkout['membership_plan'] ?? null) ? $checkout['membership_plan'] : [];
$memberDemoActive = ($checkout['member_demo_active'] ?? false) === true;
$memberDemoStatusLabel = trim((string) ($checkout['member_demo_status_label'] ?? ($memberDemoActive ? 'Activa' : 'Pendiente')));
$paymentStateLabel = $canConfirm ? 'Listo para confirmar' : 'No disponible';
$confirmButtonLabel = match ($checkoutType) {
    'reservation' => 'Confirmar reserva',
    'concessions' => 'Confirmar confiteria',
    'membership' => 'Activar membresia',
    default => 'Confirmar',
};
$paymentHelp = match ($checkoutType) {
    'reservation' => 'Tu reserva quedara confirmada. Sin cobro real.',
    'concessions' => 'Se generara un comprobante y el carrito quedara vacio. Sin cobro real.',
    'membership' => 'Tu membresia quedara activa. Sin cobro real.',
    default => 'Confirma para continuar. Sin cobro real.',
};
$reservationSeatLabels = [];

if ($reservation !== null) {
    foreach (($reservation['seats'] ?? []) as $seat) {
        $reservationSeatLabels[] = reservation_seat_key((string) ($seat['seat_row'] ?? ''), (int) ($seat['seat_number'] ?? 0));
    }
}

$reservationSeatSummary = $reservationSeatLabels !== [] ? implode(', ', $reservationSeatLabels) : 'Sin butacas';
$reservationStatus = $reservation !== null ? (string) ($reservation['status'] ?? '') : '';
$reservationCode = $reservation !== null ? reservation_visual_code((int) ($reservation['id'] ?? 0)) : '';
$reservationStatusClass = $reservationStatus !== '' ? reservation_status_css_class($reservationStatus) : 'unknown';
$reservationStatusLabel = $reservationStatus !== '' ? reservation_status_label($reservationStatus) : 'Sin estado';
$reservationRoomLabel = $reservation !== null
    ? trim((string) ($reservation['room_name'] ?? '') . ' - ' . (string) ($reservation['room_location'] ?? ''), ' -')
    : '';
$reservationFormatLabel = $reservation !== null
    ? trim((string) ($reservation['format_label'] ?? '') . ' - ' . (string) ($reservation['language_label'] ?? ''), ' -')
    : '';
$membershipBenefits = is_array($membershipPlan['benefits'] ?? null) ? $membershipPlan['benefits'] : [];
$receiptItems = $lastReceipt !== null && is_array($lastReceipt['items'] ?? null) ? $lastReceipt['items'] : [];
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($pageTitle) ?> - Reserva Salas Cine</title>
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body class="app-screen checkout-screen">
    <?php require __DIR__ . '/partials/header.php'; ?>

    <main class="checkout-shell">
        <?php if ($messages !== []): ?>
            <div class="page-messages cartelera-messages" aria-live="polite">
                <?php foreach ($messages as $message): ?>
                    <p class="notice notice-<?= e($message['type'] ?? 'info') ?>"><?= e($message['message'] ?? '') ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="checkout-heading">
            <a class="movie-back" href="<?= e($returnUrl) ?>" aria-label="Volver">
                <span aria-hidden="true"></span>
            </a>
            <div>
                <p class="eyebrow"><?= e($eyebrow) ?></p>
                <h1><?= e($heading) ?></h1>
                <?php if ($lead !== ''): ?>
                    <p><?= e($lead) ?></p>
                <?php endif; ?>
            </div>
        </div>

        <div class="checkout-layout">
            <section class="checkout-summary-panel" aria-labelledby="checkout-summary-title">
                <div class="checkout-section-heading">
                    <p class="eyebrow">Resumen</p>
                    <h2 id="checkout-summary-title"><?= e($summaryTitle) ?></h2>
                </div>

                <?php if ($checkoutType === 'reservation' && $reservation !== null): ?>
                    <dl class="checkout-details">
                        <div>
                            <dt>Codigo</dt>
                            <dd><?= e($reservationCode) ?></dd>
                        </div>
                        <div>
                            <dt>Pelicula</dt>
                            <dd><?= e($reservation['movie_title'] ?? 'Pelicula') ?></dd>
                        </div>
                        <div>
                            <dt>Funcion</dt>
                            <dd><?= e($showtimeLabels['datetime'] !== '' ? $showtimeLabels['datetime'] : 'Sin horario') ?></dd>
                        </div>
                        <div>
                            <dt>Sala</dt>
                            <dd><?= e($reservationRoomLabel !== '' ? $reservationRoomLabel : 'Sin sala') ?></dd>
                        </div>
                        <div>
                            <dt>Formato</dt>
                            <dd><?= e($reservationFormatLabel !== '' ? $reservationFormatLabel : 'Sin formato') ?></dd>
                        </div>
                        <div>
                            <dt>Butacas</dt>
                            <dd><?= e($reservationSeatSummary) ?></dd>
                        </div>
                        <div>
                            <dt>Entradas</dt>
                            <dd><?= e(count($reservationSeatLabels)) ?></dd>
                        </div>
                        <div>
                            <dt>Estado</dt>
                            <dd><span class="reservation-status-badge status-<?= e($reservationStatusClass) ?>"><?= e($reservationStatusLabel) ?></span></dd>
                        </div>
                    </dl>
                <?php elseif ($checkoutType === 'concessions'): ?>
                    <?php if ($cartLoadError): ?>
                        <div class="checkout-state">
                            <h3>No se pudo cargar el carrito</h3>
                            <p>Intenta nuevamente mas tarde.</p>
                        </div>
                    <?php elseif ($catalogSetupRequired): ?>
                        <div class="checkout-state">
                            <h3>Catalogo no disponible</h3>
                            <p>La confiteria no esta disponible en este momento.</p>
                        </div>
                    <?php elseif ($cartItems === []): ?>
                        <div class="checkout-state">
                            <h3>Carrito vacio</h3>
                            <p>Agrega productos desde Confiteria para continuar.</p>
                        </div>
                    <?php else: ?>
                        <div class="checkout-item-list">
                            <?php foreach ($cartItems as $cartItem): ?>
                                <article class="checkout-item">
                                    <div>
                                        <h3><?= e($cartItem['name'] ?? '') ?></h3>
                                        <p><?= e($cartItem['unit_price_label'] ?? '') ?> unidad</p>
                                    </div>
                                    <div>
                                        <span>Cant. <?= e($cartItem['quantity'] ?? 0) ?></span>
                                        <strong><?= e($cartItem['subtotal_label'] ?? '') ?></strong>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($lastReceipt !== null): ?>
                        <section class="checkout-receipt" aria-labelledby="checkout-receipt-title">
                            <p class="eyebrow">Ultima compra</p>
                            <h3 id="checkout-receipt-title"><?= e($lastReceipt['code'] ?? 'Comprobante') ?></h3>
                            <p>Tu compra esta lista.</p>
                            <?php if ($receiptItems !== []): ?>
                                <ul>
                                    <?php foreach ($receiptItems as $receiptItem): ?>
                                        <li>
                                            <?= e($receiptItem['quantity'] ?? 0) ?> x <?= e($receiptItem['name'] ?? '') ?>
                                            <strong><?= e($receiptItem['subtotal_label'] ?? '') ?></strong>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>
                            <strong><?= e($lastReceipt['total_label'] ?? reservation_format_money(0)) ?></strong>
                        </section>
                    <?php endif; ?>
                <?php elseif ($checkoutType === 'membership'): ?>
                    <div class="checkout-membership-plan">
                        <h3><?= e($membershipPlan['name'] ?? CHECKOUT_MEMBERSHIP_PLAN_LABEL) ?></h3>
                        <p>Activa tu estado de socio. No habra cobro real.</p>
                        <?php if ($memberDemoActive): ?>
                            <span class="reservation-status-badge status-confirmed"><?= e($memberDemoStatusLabel) ?></span>
                        <?php else: ?>
                            <span class="reservation-status-badge status-pending"><?= e($memberDemoStatusLabel) ?></span>
                        <?php endif; ?>
                    </div>

                    <?php if ($membershipBenefits !== []): ?>
                        <ul class="checkout-benefits">
                            <?php foreach ($membershipBenefits as $benefit): ?>
                                <li><?= e($benefit) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                <?php endif; ?>

                <dl class="checkout-amount-list" aria-label="Totales del pago">
                    <div>
                        <dt>Subtotal</dt>
                        <dd><?= e($subtotalLabel) ?></dd>
                    </div>
                    <div>
                        <dt>Descuento</dt>
                        <dd><?= e($discountLabel) ?></dd>
                    </div>
                    <div>
                        <dt>Total final</dt>
                        <dd><?= e($totalFinalLabel) ?></dd>
                    </div>
                </dl>
            </section>

            <aside class="checkout-payment-panel" aria-labelledby="checkout-payment-title">
                <div class="checkout-section-heading">
                    <p class="eyebrow">Metodo</p>
                    <h2 id="checkout-payment-title">Pago de prueba</h2>
                </div>

                <dl class="checkout-payment-details">
                    <div>
                        <dt>Estado</dt>
                        <dd><?= e($paymentStateLabel) ?></dd>
                    </div>
                    <div>
                        <dt>Modo</dt>
                        <dd>Sin cobro real</dd>
                    </div>
                    <div>
                        <dt>Datos sensibles</dt>
                        <dd>No se solicitan ni almacenan datos de pago.</dd>
                    </div>
                </dl>

                <section class="checkout-coupon-panel" aria-labelledby="checkout-coupon-title">
                    <div class="checkout-coupon-heading">
                        <p class="eyebrow">Cupon</p>
                        <h3 id="checkout-coupon-title">Descuento</h3>
                    </div>

                    <?php if ($couponApplied): ?>
                        <div class="checkout-coupon-applied">
                            <div>
                                <span>Cupon aplicado</span>
                                <strong><?= e($couponCode) ?></strong>
                                <p><?= e(trim($couponLabel . ' ' . $couponPercentLabel)) ?></p>
                            </div>
                            <!-- Formulario original (oculto) -->
<form id="confirm-form" class="checkout-confirm-form" action="index.php?action=checkout_confirm" method="post" style="display: none;">
    <?= csrf_token_field() ?>
    <?php foreach ($confirmFields as $fieldName => $fieldValue): ?>
        <input type="hidden" name="<?= e($fieldName) ?>" value="<?= e($fieldValue) ?>">
    <?php endforeach; ?>
</form>

<!-- Botón que abre el modal -->
<button id="btn-abrir-modal" class="checkout-confirm-button" type="button"<?= $canConfirm ? '' : ' disabled' ?>>
    <?= e($confirmButtonLabel) ?>
</button>
                        </div>
                    <?php endif; ?>

                    <form class="checkout-coupon-form" action="index.php?action=coupon_apply" method="post">
                        <?= csrf_token_field() ?>
                        <?php foreach ($couponFields as $fieldName => $fieldValue): ?>
                            <input type="hidden" name="<?= e($fieldName) ?>" value="<?= e($fieldValue) ?>">
                        <?php endforeach; ?>
                        <label for="coupon-code">Codigo de cupon</label>
                        <div>
                            <input id="coupon-code" name="coupon_code" type="text" maxlength="24" autocomplete="off" placeholder="CINE10">
                            <button type="submit">Aplicar</button>
                        </div>
                    </form>
                </section>

                <p class="checkout-payment-note"><?= e($paymentHelp) ?></p>

                <!-- Formulario original (oculto, se enviará después del pago) -->
<form id="confirm-form" class="checkout-confirm-form" action="index.php?action=checkout_confirm" method="post" style="display: none;">
    <?= csrf_token_field() ?>
    <?php foreach ($confirmFields as $fieldName => $fieldValue): ?>
        <input type="hidden" name="<?= e($fieldName) ?>" value="<?= e($fieldValue) ?>">
    <?php endforeach; ?>
</form>

<!-- Nuevo botón que abre el modal de pago -->
<button id="btn-abrir-modal" class="checkout-confirm-button" type="button"<?= $canConfirm ? '' : ' disabled' ?>>
    <?= e($confirmButtonLabel) ?>
</button>

                <a class="checkout-secondary-link" href="<?= e($returnUrl) ?>">Volver</a>
            </aside>
        </div>
    </main>

    <script src="assets/js/app.js" defer></script>
     <!-- CARGAR BOOTSTRAP PRIMERO, ANTES QUE CUALQUIER OTRO SCRIPT -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- MODAL DE PAGO - HEADER COMPACTO CON LOGO GRANDE -->
<div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header" style="background-color: #009ee3; color: white; border-bottom: none; padding: 12px 20px;">
        <!-- Logo Mercado Papu (grande) -->
        <img src="assets/img/mercado-papu.png" alt="Mercado Papu" style="height: 90px; width: auto; border-radius: 3px;">
        
        <!-- Botón cerrar -->
        <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal"></button>
      </div>
      
      <div class="modal-body p-4">
        <!-- Número de tarjeta -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-muted small">NÚMERO DE TARJETA</label>
          <input id="pay-number" type="text" class="form-control" placeholder="0000 0000 0000 0000" maxlength="19">
        </div>
        
        <!-- Titular -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-muted small">TITULAR</label>
          <input id="pay-name" type="text" class="form-control" placeholder="Nombre en la tarjeta">
        </div>
        
        <!-- Expiración y CVV -->
        <div class="row g-3 mb-4">
          <div class="col-6">
            <label class="form-label fw-semibold text-muted small">EXPIRACIÓN</label>
            <input id="pay-expiry" type="text" class="form-control" placeholder="MM/AA" maxlength="5">
          </div>
          <div class="col-6">
            <label class="form-label fw-semibold text-muted small">CVV</label>
            <input id="pay-cvv" type="text" class="form-control" placeholder="123" maxlength="3">
          </div>
        </div>
        
        <!-- Mensaje de estado -->
        <div id="pay-status" class="mb-3 text-center small"></div>
        
        <!-- Botón confirmar -->
        <button id="pay-confirm-btn" type="button" class="btn w-100 fw-bold" style="background-color: #009ee3; color: white; padding: 12px; border: none;">
          CONFIRMAR PAGO
        </button>
      </div>
    </div>
  </div>
</div>
</div>
<!-- SCRIPT DE PAGO PARA CHECKOUT -->
<script>
window.addEventListener('load', function() {
    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap no cargado");
        return;
    }
    
    // Botón que abre el modal
    document.getElementById("btn-abrir-modal")?.addEventListener("click", function(e) {
        e.preventDefault();
        new bootstrap.Modal(document.getElementById("paymentModal")).show();
    });
    
    // Confirmar pago
    document.getElementById("pay-confirm-btn")?.addEventListener("click", function() {
        const number = document.getElementById("pay-number").value.replace(/\s/g, "");
        const name = document.getElementById("pay-name").value.trim();
        const expiry = document.getElementById("pay-expiry").value.trim();
        const cvv = document.getElementById("pay-cvv").value.trim();
        const statusDiv = document.getElementById("pay-status");
        
        if (number.length !== 16) {
            statusDiv.innerHTML = '<span class="text-danger">Número inválido (16 dígitos)</span>';
            return;
        }
        if (name.length < 3) {
            statusDiv.innerHTML = '<span class="text-danger">Nombre requerido</span>';
            return;
        }
        if (!expiry.match(/^\d{2}\/\d{2}$/)) {
            statusDiv.innerHTML = '<span class="text-danger">Formato MM/AA</span>';
            return;
        }
        if (cvv.length !== 3) {
            statusDiv.innerHTML = '<span class="text-danger">CVV inválido (3 dígitos)</span>';
            return;
        }
        
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = "Procesando...";
        statusDiv.innerHTML = '<span class="text-secondary">Procesando...</span>';
        
        setTimeout(() => {
            if (number === "1111111111111111" || number === "2222222222222222" || number === "3333333333333333") {
                statusDiv.innerHTML = '<span class="text-danger">Pago rechazado</span>';
                btn.disabled = false;
                btn.innerHTML = "CONFIRMAR PAGO";
                return;
            }
            
            statusDiv.innerHTML = '<span class="text-success">¡Pago aprobado!</span>';
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById("paymentModal"))?.hide();
                document.getElementById("confirm-form").submit();
            }, 1000);
        }, 2000);
    });
    
    // Formateadores
    document.getElementById("pay-number")?.addEventListener("input", function() {
        this.value = this.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    });
    document.getElementById("pay-expiry")?.addEventListener("input", function() {
        let val = this.value.replace(/\D/g, "");
        if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
        this.value = val.substring(0, 5);
    });
    document.getElementById("pay-cvv")?.addEventListener("input", function() {
        this.value = this.value.replace(/\D/g, "").substring(0, 3);
    });
});
</script>
<script>
// Control del botón que abre el modal
document.addEventListener("DOMContentLoaded", function() {
    const btnAbrirModal = document.getElementById("btn-abrir-modal");
    
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", function(e) {
            e.preventDefault();
            // Abrir modal de pago
            const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
            modal.show();
        });
    }
});
</script>
<!-- Modal de pago -->
<div class="modal fade" id="paymentModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header" style="background-color: #009ee3; color: white;">
        <img src="assets/img/mercado-papu.png" height="60px">
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input id="pay-number" class="form-control" placeholder="Número de tarjeta">
        <input id="pay-name" class="form-control mt-2" placeholder="Titular">
        <div class="row mt-2">
          <div class="col-6"><input id="pay-expiry" class="form-control" placeholder="MM/AA"></div>
          <div class="col-6"><input id="pay-cvv" class="form-control" placeholder="CVV"></div>
        </div>
        <div id="pay-status" class="mt-2 text-center"></div>
        <button id="pay-confirm-btn" class="btn btn-primary w-100 mt-3">CONFIRMAR PAGO</button>
      </div>
    </div>
  </div>
</div>
</body>
</html>
