(() => {
  "use strict";

  const WHATSAPP_NUMBER = "51987272246"; // +51 987272246

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];

  // Header shadow
  const header = qs(".header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const burger = qs(".nav__burger");
  const links = qs(".nav__links");

  if (burger && links) {
    burger.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        links.style.display = "flex";
        links.style.flexDirection = "column";
        links.style.position = "absolute";
        links.style.top = "72px";
        links.style.right = "4%";
        links.style.background = "rgba(255,255,255,.55)";
        links.style.border = "1px solid rgba(91,58,63,.18)";
        links.style.borderRadius = "18px";
        links.style.padding = "12px";
        links.style.boxShadow = "0 18px 55px rgba(45,16,23,.12)";
        links.style.backdropFilter = "blur(10px)";
        links.style.gap = "6px";
      } else {
        links.style.display = "";
      }
    });

    qsa(".nav__link").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        links.style.display = "";
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal
  const revealEls = qsa(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Footer year
  const year = qs("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // -----------------------
  // CARRITO
  // -----------------------
  const cartDrawer = qs("#cartDrawer");
  const cartItemsEl = qs("#cartItems");
  const cartTotalEl = qs("#cartTotal");
  const cartCountEl = qs("#cartCount");

  const openCartBtn = qs("#openCart");
  const openCartBtn2 = qs("#openCart2");
  const openCartBtn3 = qs("#openCart3");
  const closeCartBtn = qs("#closeCart");
  const closeOverlay = qs("#closeCartOverlay");
  const sendOrderBtn = qs("#sendOrder");
  const clearCartBtn = qs("#clearCart");

  // cart state
  const cart = new Map(); // id -> {id, name, price, img, qty}

  const money = (n) => `S/ ${Number(n).toFixed(0)}`;

  const setCartCount = () => {
    let count = 0;
    cart.forEach(i => count += i.qty);
    cartCountEl.textContent = String(count);
  };

  const calcTotal = () => {
    let total = 0;
    cart.forEach(i => total += i.price * i.qty);
    return total;
  };

  const renderCart = () => {
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = "";

    if (cart.size === 0) {
      cartItemsEl.innerHTML = `
        <div class="cartItem" style="grid-template-columns:1fr;">
          <p style="margin:0;font-weight:900;">Tu carrito está vacío.</p>
          <p style="margin:6px 0 0;color:rgba(91,58,63,.72);font-weight:700;">
            Agrega productos del catálogo y envía tu pedido por WhatsApp.
          </p>
        </div>
      `;
    } else {
      cart.forEach((item) => {
        const row = document.createElement("div");
        row.className = "cartItem";

        row.innerHTML = `
          <img src="${item.img}" alt="${item.name}">
          <div>
            <p class="cartItem__title">${item.name}</p>
            <div class="cartItem__meta">
              <span>${money(item.price)}</span>
              <div class="qty">
                <button class="dec" aria-label="Disminuir">−</button>
                <span>${item.qty}</span>
                <button class="inc" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>
        `;

        row.querySelector(".dec").addEventListener("click", () => {
          item.qty -= 1;
          if (item.qty <= 0) cart.delete(item.id);
          renderCart();
        });

        row.querySelector(".inc").addEventListener("click", () => {
          item.qty += 1;
          renderCart();
        });

        cartItemsEl.appendChild(row);
      });
    }

    cartTotalEl.textContent = money(calcTotal());
    setCartCount();
  };

  const openCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    renderCart();
  };

  const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
  };

  openCartBtn?.addEventListener("click", openCart);
  openCartBtn2?.addEventListener("click", openCart);
  openCartBtn3?.addEventListener("click", openCart);
  closeCartBtn?.addEventListener("click", closeCart);
  closeOverlay?.addEventListener("click", closeCart);

  clearCartBtn?.addEventListener("click", () => {
    cart.clear();
    renderCart();
  });

  // Add to cart buttons
  qsa(".cItem").forEach((card) => {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price || 0);
    const img = card.dataset.img;

    const btn = card.querySelector(".addToCart");
    btn?.addEventListener("click", () => {
      if (!id) return;
      const exists = cart.get(id);
      if (exists) {
        exists.qty += 1;
      } else {
        cart.set(id, { id, name, price, img, qty: 1 });
      }
      renderCart();
      openCart();
    });
  });

  // Send order to WhatsApp
  const buildOrderMessage = () => {
    if (cart.size === 0) return null;

    let lines = [];
    lines.push("Hola La Mordida 👋✨");
    lines.push("Quiero hacer este pedido:");
    lines.push("");

    cart.forEach((i) => {
      lines.push(`• ${i.name}  x${i.qty}  (${money(i.price)} c/u)`);
    });

    lines.push("");
    lines.push(`Total: ${money(calcTotal())}`);
    lines.push("");
    lines.push("¿Me confirmas disponibilidad y tiempo de entrega? 💗");

    return lines.join("\n");
  };

  const openWhatsAppWithText = (text) => {
    const url = `gracias.html`;
    window.open(url, "_blank", "noopener");
  };

  const sendOrderBtnSafe = qs("#sendOrder");
  sendOrderBtnSafe?.addEventListener("click", () => {
    const msg = buildOrderMessage();
    if (!msg) {
      alert("Tu carrito está vacío. Agrega productos del catálogo.");
      return;
    }
    openWhatsAppWithText(msg);
  });

  // -----------------------
  // FORM CONTACTO -> WhatsApp REAL
  // -----------------------
  const contactForm = qs("#contactForm");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(contactForm);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const lines = [
      "Hola La Mordida 👋✨",
      "Quisiera información / cotización:",
      "",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Mensaje: ${message}`,
    ];

    if (cart.size > 0) {
      lines.push("");
      lines.push("Además, tengo este carrito:");
      cart.forEach((i) => {
        lines.push(`• ${i.name} x${i.qty} (${money(i.price)} c/u)`);
      });
      lines.push(`Total: ${money(calcTotal())}`);
    }

    openWhatsAppWithText(lines.join("\n"));
  });
})();