/* Shared portfolio interactions. Webflow still owns tabs and the review slider. */
(() => {
    "use strict";

    function init() {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const easing = "cubic-bezier(.22, 1, .36, 1)";

        // The exported click/second-click interactions retain their own toggle state.
        // Replace IX2 as a whole, rather than running two animation engines on one element.
        window.Webflow?.require("ix2")?.destroy();
        document.documentElement.classList.add("w-mod-ix", "site-enhanced");
        document.querySelectorAll("[data-w-id]").forEach((element) => {
            element.style.removeProperty("opacity");
            element.style.removeProperty("transform");
            element.style.removeProperty("transform-style");
        });

        document.querySelectorAll("[data-copyright-year]").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });

        function animate(element, frames, options = {}) {
            if (!element || reducedMotion.matches || !element.animate) return null;
            return element.animate(frames, { duration: 500, easing, ...options });
        }

        const navigation = setupNavigation();

        function closeNavigation() {
            navigation.close();
        }

        setupModal();
        setupCatalog();
        setupQuestions();
        setupMotion();

        // Contact details are intentionally fictional; never launch a mail/phone app.
        document.querySelectorAll("[data-demo-contact]").forEach((element) => {
            element.title = "Demo contact — portfolio project";
        });
        document.addEventListener("click", (event) => {
            if (event.target.closest("[data-demo-contact], .social-links-footer-3 a[href='#']")) {
                event.preventDefault();
            }
        }, true);

        function setupNavigation() {
            const oldHeader = document.querySelector(".w-nav");
            if (!oldHeader) return { close() {} };
            window.Webflow?.require("navbar")?.destroy?.();

            // One shared template replaces the different exported headers on every page.
            // Contact actions are deliberately outside the navigation panel.
            const header = document.createElement("header");
            header.className = "site-header";
            header.innerHTML = `
                <div class="site-header__inner">
                    <a href="index.html" class="site-brand" aria-label="Puffy home">
                        <img src="img/Logo_F.png" width="46" height="46" alt="" />
                        <span>PUFFY</span>
                    </a>
                    <nav class="site-navigation" id="site-navigation" aria-label="Main navigation">
                        <div class="site-nav__group">
                            <button type="button" class="site-nav__group-button" aria-expanded="false" aria-controls="site-catalog-links">
                                Catalog <span class="site-nav__arrow" aria-hidden="true"></span>
                            </button>
                            <div class="site-nav__submenu" id="site-catalog-links" aria-hidden="true" inert>
                                <div class="site-nav__submenu-clip"><div class="site-nav__submenu-links">
                                    <a href="catalog.html#pear" class="site-nav__link">Bean Bag - pear</a>
                                    <a href="catalog.html#ball" class="site-nav__link">Bean Bag - ball</a>
                                    <a href="catalog.html#children" class="site-nav__link">Bean Bag - children's pouf</a>
                                </div></div>
                            </div>
                        </div>
                        <div class="site-nav__group">
                            <button type="button" class="site-nav__group-button" aria-expanded="false" aria-controls="site-customer-links">
                                For customers <span class="site-nav__arrow" aria-hidden="true"></span>
                            </button>
                            <div class="site-nav__submenu" id="site-customer-links" aria-hidden="true" inert>
                                <div class="site-nav__submenu-clip"><div class="site-nav__submenu-links">
                                    <a href="promotions-and-gifts.html" class="site-nav__link">Promotions and gifts</a>
                                    <a href="delivery.html" class="site-nav__link">Payment and delivery</a>
                                </div></div>
                            </div>
                        </div>
                        <a href="index.html#About-Us" class="site-nav__link">About Us</a>
                        <a href="#Contacts" class="site-nav__link">Contacts</a>
                    </nav>
                    <div class="site-header__actions">
                        <a href="#" data-demo-contact class="site-header__phone">+39 351 728 4069</a>
                        <a href="#" class="site-call-button w-button">Request a call</a>
                    </div>
                    <button type="button" class="site-menu-toggle" aria-label="Open menu" aria-controls="site-navigation" aria-expanded="false">
                        <span class="site-menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
                    </button>
                </div>`;
            oldHeader.replaceWith(header);

            const backdrop = document.createElement("div");
            backdrop.className = "site-nav-backdrop";
            backdrop.hidden = true;
            backdrop.setAttribute("aria-hidden", "true");
            document.body.append(backdrop);

            const mobile = window.matchMedia("(max-width: 991px)");
            const menu = header.querySelector(".site-navigation");
            const toggle = header.querySelector(".site-menu-toggle");
            const groups = [...header.querySelectorAll(".site-nav__group")];
            let menuOpen = false;
            let scrollLocked = false;
            let previousOverflow = "";

            function setGroup(group, open) {
                group.toggleAttribute("data-open", open);
                group.querySelector("button").setAttribute("aria-expanded", String(open));
                const submenu = group.querySelector(".site-nav__submenu");
                submenu.setAttribute("aria-hidden", String(!open));
                submenu.inert = !open;
            }

            function close({ restoreFocus = false } = {}) {
                menuOpen = false;
                header.removeAttribute("data-menu-open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-label", "Open menu");
                backdrop.hidden = true;
                menu.inert = mobile.matches;
                menu.setAttribute("aria-hidden", String(mobile.matches));
                groups.forEach((group) => setGroup(group, false));
                if (scrollLocked) {
                    document.body.style.overflow = previousOverflow;
                    scrollLocked = false;
                }
                if (restoreFocus) toggle.focus({ preventScroll: true });
            }

            toggle.addEventListener("click", () => {
                if (menuOpen) return close({ restoreFocus: true });
                menuOpen = true;
                header.setAttribute("data-menu-open", "");
                toggle.setAttribute("aria-expanded", "true");
                toggle.setAttribute("aria-label", "Close menu");
                menu.inert = false;
                menu.setAttribute("aria-hidden", "false");
                backdrop.hidden = false;
                previousOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";
                scrollLocked = true;
                menu.querySelector("button").focus({ preventScroll: true });
            });

            groups.forEach((group) => {
                group.querySelector("button").addEventListener("click", () => {
                    const opening = !group.hasAttribute("data-open");
                    if (!mobile.matches) groups.filter((other) => other !== group).forEach((other) => setGroup(other, false));
                    setGroup(group, opening);
                });
            });

            header.addEventListener("click", (event) => {
                const link = event.target.closest("a[href]");
                if (!link || link.hasAttribute("data-demo-contact") || link.classList.contains("site-call-button") ||
                    event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                close();
                const url = new URL(link.href, location.href);
                const target = url.pathname === location.pathname && url.hash
                    ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
                if (!target) return;
                event.preventDefault();
                event.stopPropagation();
                history.pushState(null, "", url.hash);
                target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
            });

            backdrop.addEventListener("click", () => close({ restoreFocus: true }));
            document.addEventListener("click", (event) => {
                if (header.contains(event.target)) return;
                const expanded = groups.some((group) => group.hasAttribute("data-open"));
                if (menuOpen || expanded) close();
            });
            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    if (menuOpen) {
                        event.preventDefault();
                        close({ restoreFocus: true });
                    } else {
                        const expanded = groups.find((group) => group.hasAttribute("data-open"));
                        if (expanded) {
                            close();
                            expanded.querySelector("button").focus({ preventScroll: true });
                        }
                    }
                }
                if (event.key !== "Tab" || !menuOpen) return;
                const focusable = [...header.querySelectorAll("a[href], button")]
                    .filter((element) => !element.closest("[inert]") && element.getClientRects().length);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });

            function updateHeight() {
                document.documentElement.style.setProperty("--site-header-height", `${header.offsetHeight}px`);
            }
            mobile.addEventListener("change", () => { close(); updateHeight(); });
            if ("ResizeObserver" in window) new ResizeObserver(updateHeight).observe(header);
            else window.addEventListener("resize", updateHeight);
            updateHeight();
            close();
            return { close };
        }

        function setupModal() {
            const overlay = document.querySelector(".form-bg");
            if (!overlay) return;
            const panel = overlay.querySelector(".forma-simple-2");
            const backdrop = overlay.querySelector(".all_dark");
            const closeButton = panel.querySelector("._123123-2");
            const heading = panel.querySelector(".box-zagolovok");
            let isOpen = false;
            let transition = 0;
            let opener = null;
            let animations = [];
            let backgroundState = [];
            let previousOverflow = "";

            // Outside .all_site's overflow/stacking context, above the header and menu.
            document.body.append(overlay);
            overlay.style.removeProperty("display");
            overlay.hidden = true;
            overlay.setAttribute("aria-hidden", "true");
            panel.style.removeProperty("opacity");
            panel.style.removeProperty("transform");
            panel.setAttribute("role", "dialog");
            panel.setAttribute("aria-modal", "true");
            panel.tabIndex = -1;
            heading.id = "callback-title";
            panel.setAttribute("aria-labelledby", heading.id);
            backdrop.setAttribute("aria-hidden", "true");
            panel.querySelector("input[type='tel']").setAttribute("aria-label", "Your phone number");
            panel.querySelector("input[type='tel']").autocomplete = "tel";

            const form = panel.querySelector("[data-demo-form]");
            const success = panel.querySelector(".w-form-done");
            success.textContent = "Thanks for trying the demo! No request has been sent.";
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                form.hidden = true;
                success.style.display = "block";
                success.focus();
            }, true);

            const triggerSelector = "a.w-button[href='#'], .subtitle_5_2";
            document.querySelectorAll(triggerSelector).forEach((element) => {
                element.setAttribute("aria-haspopup", "dialog");
                element.setAttribute("aria-controls", "callback-dialog");
            });
            panel.id = "callback-dialog";

            function stopAnimations() {
                animations.forEach((animation) => animation?.cancel());
                animations = [];
            }

            function lockBackground() {
                if (backgroundState.length) return;
                previousOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";
                backgroundState = [...document.body.children]
                    .filter((element) => element !== overlay)
                    .map((element) => ({ element, inert: element.inert }));
                backgroundState.forEach(({ element }) => { element.inert = true; });
            }

            function unlockBackground() {
                backgroundState.forEach(({ element, inert }) => { element.inert = inert; });
                backgroundState = [];
                document.body.style.overflow = previousOverflow;
            }

            function open(trigger) {
                if (isOpen) return;
                isOpen = true;
                transition++;
                stopAnimations();
                opener = trigger;
                closeNavigation();
                lockBackground();
                overlay.hidden = false;
                overlay.setAttribute("aria-hidden", "false");
                overlay.scrollTop = 0;
                form.hidden = false;
                success.style.display = "none";
                animations = [
                    animate(backdrop, [{ opacity: 0 }, { opacity: .85 }], { duration: 240 }),
                    animate(panel, [
                        { opacity: 0, transform: "translateY(18px) scale(.98)" },
                        { opacity: 1, transform: "translateY(0) scale(1)" }
                    ], { duration: 380 })
                ];
                panel.querySelector("input[type='tel']").focus({ preventScroll: true });
            }

            async function close() {
                if (!isOpen) return;
                isOpen = false;
                const currentTransition = ++transition;
                stopAnimations();
                animations = [
                    animate(backdrop, [{ opacity: .85 }, { opacity: 0 }], { duration: 180, fill: "forwards" }),
                    animate(panel, [
                        { opacity: 1, transform: "translateY(0) scale(1)" },
                        { opacity: 0, transform: "translateY(10px) scale(.99)" }
                    ], { duration: 180, fill: "forwards" })
                ];
                await Promise.all(animations.map((animation) => animation?.finished.catch(() => {})));
                if (transition !== currentTransition || isOpen) return;
                overlay.hidden = true;
                overlay.setAttribute("aria-hidden", "true");
                stopAnimations();
                unlockBackground();
                if (opener?.isConnected) opener.focus({ preventScroll: true });
            }

            document.addEventListener("click", (event) => {
                const trigger = event.target.closest(triggerSelector);
                if (!trigger || overlay.contains(trigger)) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                open(trigger);
            }, true);
            closeButton.addEventListener("click", close);
            overlay.addEventListener("click", (event) => {
                if (event.target === backdrop || event.target === overlay) close();
            });
            document.addEventListener("keydown", (event) => {
                if (overlay.hidden) return;
                if (event.key === "Escape") {
                    event.preventDefault();
                    close();
                }
                if (event.key !== "Tab") return;
                const focusable = [...panel.querySelectorAll("button, a[href], input, [tabindex='0']")]
                    .filter((element) => !element.disabled && element.getClientRects().length);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });
        }

        function setupCatalog() {
            const tabs = document.querySelector(".w-tabs");
            if (!tabs) return;
            const categories = { pear: "Tab 1", ball: "Tab 2", children: "Tab 3" };
            const aliases = {
                "Catalog---pear": "pear",
                "Catalog-ball": "ball",
                "Childrens-Pouf": "children"
            };
            let applyingHash = false;

            function categoryFromHash(hash) {
                const key = hash.replace(/^#/, "");
                return categories[key] ? key : aliases[key];
            }

            function selectCategory(category, scroll = false) {
                const link = tabs.querySelector(`.w-tab-link[data-w-tab="${categories[category]}"]`);
                if (!link) return;
                applyingHash = true;
                link.click();
                applyingHash = false;
                if (scroll) {
                    const heading = document.querySelector(".h2_catalog");
                    const header = document.querySelector(".site-header");
                    const top = heading.getBoundingClientRect().top + window.scrollY
                        - (header?.getBoundingClientRect().height || 0) - 24;
                    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? "instant" : "smooth" });
                }
            }

            function readLocation() {
                const category = location.hash ? categoryFromHash(location.hash) : "pear";
                if (category) selectCategory(category);
            }

            document.addEventListener("click", (event) => {
                const link = event.target.closest("a[href]");
                if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                const url = new URL(link.href, location.href);
                const category = categoryFromHash(url.hash);
                if (!category || url.pathname !== location.pathname || link.matches(".w-tab-link")) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                closeNavigation();
                if (location.hash !== `#${category}`) history.pushState(null, "", `#${category}`);
                selectCategory(category, true);
            }, true);

            tabs.querySelectorAll(".w-tab-link").forEach((link) => {
                link.addEventListener("click", () => {
                    if (applyingHash) return;
                    const category = Object.keys(categories).find((key) => categories[key] === link.dataset.wTab);
                    if (category && location.hash !== `#${category}`) history.pushState(null, "", `#${category}`);
                });
            });
            window.addEventListener("hashchange", readLocation);
            window.addEventListener("popstate", readLocation);
            readLocation();
        }

        function setupQuestions() {
            document.querySelectorAll(".drop-down-2").forEach((dropdown, index) => {
                const toggle = dropdown.querySelector(".drop-1");
                const panel = dropdown.querySelector(".open-drop");
                let animation = null;
                // Desktop Webflow dropdowns toggle on mouseup, before click. Remove
                // their handlers here so they cannot race the custom accordion.
                window.jQuery?.(dropdown).off(".w-dropdown");
                window.jQuery?.(toggle).off(".w-dropdown");
                toggle.id = `faq-question-${index}`;
                panel.id = `faq-answer-${index}`;
                toggle.setAttribute("aria-controls", panel.id);
                toggle.setAttribute("aria-expanded", "false");
                toggle.removeAttribute("aria-haspopup");
                panel.setAttribute("role", "region");
                panel.setAttribute("aria-labelledby", toggle.id);
                panel.hidden = true;

                function toggleAnswer(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    const opening = toggle.getAttribute("aria-expanded") !== "true";
                    const oldHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
                    const oldStyle = getComputedStyle(panel);
                    const oldPaddingTop = panel.hidden ? "0px" : oldStyle.paddingTop;
                    const oldPaddingBottom = panel.hidden ? "0px" : oldStyle.paddingBottom;
                    const oldMargin = panel.hidden ? "0px" : oldStyle.marginTop;
                    animation?.cancel();
                    panel.hidden = false;
                    panel.classList.add("faq-panel");
                    toggle.setAttribute("aria-expanded", String(opening));
                    dropdown.classList.toggle("is-open", opening);
                    const height = panel.getBoundingClientRect().height;
                    animation = animate(panel, [
                        { height: `${oldHeight}px`, paddingTop: oldPaddingTop, paddingBottom: oldPaddingBottom,
                            marginTop: oldMargin, opacity: opening && oldHeight === 0 ? 0 : 1 },
                        { height: opening ? `${height}px` : "0px", paddingTop: opening ? "20px" : "0px",
                            paddingBottom: opening ? "20px" : "0px", marginTop: opening ? "15px" : "0px",
                            opacity: opening ? 1 : 0 }
                    ], { duration: 300 });
                    const currentAnimation = animation;
                    const finish = () => {
                        if (animation !== currentAnimation) return;
                        panel.hidden = !opening;
                        animation = null;
                    };
                    if (animation) animation.finished.then(finish).catch(() => {});
                    else finish();
                }

                toggle.addEventListener("click", toggleAnswer, true);
                toggle.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") toggleAnswer(event);
                }, true);
            });
        }

        function setupMotion() {
            // Reveal only once; content stays visible if JS or IntersectionObserver is unavailable.
            const hero = document.querySelectorAll(".left_1 > .h1, .left_1 > .subtitle_1, .left_1 > .plate_all_1");
            hero.forEach((element, index) => {
                animate(element, [
                    { opacity: 0, transform: "translateY(16px)" },
                    { opacity: 1, transform: "translateY(0)" }
                ], { delay: index * 70, fill: "backwards", duration: 650 });
            });
            const heroImage = document.querySelector(".photo_1");
            if (heroImage && !reducedMotion.matches) {
                heroImage.classList.add("reveal-pending");
                const revealHero = () => {
                    heroImage.classList.remove("reveal-pending");
                    animate(heroImage, [
                        { opacity: 0, transform: "translateX(-100px)" },
                        { opacity: 1, transform: "translateX(0)" }
                    ], { duration: 1000 });
                };
                if (heroImage.complete) revealHero();
                else {
                    heroImage.loading = "eager";
                    heroImage.decode().catch(() => {}).then(revealHero);
                }
            }

            if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
            const reveals = new WeakMap();
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const element = entry.target;
                    reveals.get(element)();
                    observer.unobserve(element);
                });
            }, { threshold: .12 });

            function revealOnScroll(element, frames, options = {}, trigger = element) {
                if (!element) return;
                element.classList.add("reveal-pending");
                const play = () => {
                    element.classList.remove("reveal-pending");
                    animate(element, frames, { duration: 650, fill: "backwards", ...options });
                };
                reveals.set(trigger, () => {
                    if (element instanceof HTMLImageElement && !element.complete) {
                        element.decode().catch(() => {}).then(play);
                    } else {
                        play();
                    }
                });
                observer.observe(trigger);
            }

            document.querySelectorAll(".all_benefits_2 > div").forEach((element, index) => {
                revealOnScroll(element, [
                    { opacity: 0, transform: "translateY(44px)" },
                    { opacity: 1, transform: "translateY(0)" }
                ], { delay: index * 110, duration: 700 });
            });

            document.querySelectorAll(".photo_6").forEach((element) => {
                revealOnScroll(element, [
                    { opacity: 0, transform: "translateX(-80px)" },
                    { opacity: 1, transform: "translateX(0)" }
                ], { duration: 900 }, element.closest(".section_6") || element);
            });

            const questionScene = document.querySelector(".left_8");
            if (questionScene) {
                const questions = [1, 2, 3].map((index) => questionScene.querySelector(`.question_8_${index}`));
                questions.forEach((element) => element?.classList.add("reveal-pending"));
                reveals.set(questionScene, () => {
                    Promise.all(questions.filter(Boolean).map((element) => element.decode().catch(() => {}))).then(() => {
                        questions.forEach((element, index) => {
                            if (!element) return;
                            element.classList.remove("reveal-pending");
                            animate(element, [{ opacity: 0 }, { opacity: 1 }], {
                                duration: 450, delay: index * 180, fill: "backwards"
                            });
                        });
                    });
                });
                observer.observe(questionScene);
            }

            document.querySelectorAll(
                ".left-right_4, .section_5 .grid_5, .back_6, " +
                ".left-right_4_gift, .right_4_delivery, .button_delivery, .right_8"
            ).forEach((element) => {
                if (element.getBoundingClientRect().top < window.innerHeight) return;
                revealOnScroll(element, [
                    { opacity: 0, transform: "translateY(20px)" },
                    { opacity: 1, transform: "translateY(0)" }
                ]);
            });
            reducedMotion.addEventListener("change", () => {
                if (!reducedMotion.matches) return;
                observer.disconnect();
                document.querySelectorAll(".reveal-pending").forEach((element) => element.classList.remove("reveal-pending"));
                document.getAnimations().forEach((animation) => animation.finish());
            });
        }
    }

    window.Webflow = window.Webflow || [];
    window.Webflow.push(init);
})();
