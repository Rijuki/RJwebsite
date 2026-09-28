/* Renee Julian S.L. — site behaviour */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {

        /* ── Header state ───────────────────────────────── */
        var header = document.querySelector('.header');
        var nav = document.getElementById('nav');
        var hamburger = document.getElementById('hamburger');

        function onScroll() {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        /* ── Mobile nav ─────────────────────────────────── */
        function closeNav() {
            nav.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        }

        function openNav() {
            nav.classList.add('open');
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.classList.add('nav-open');
        }

        hamburger.addEventListener('click', function () {
            if (nav.classList.contains('open')) { closeNav(); } else { openNav(); }
        });

        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeNav();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });

        // Close the menu if the viewport grows back to desktop
        var desktop = window.matchMedia('(min-width: 861px)');
        function onBreakpoint(e) { if (e.matches) closeNav(); }
        if (typeof desktop.addEventListener === 'function') {
            desktop.addEventListener('change', onBreakpoint);
        } else if (typeof desktop.addListener === 'function') {
            desktop.addListener(onBreakpoint);
        }

        /* ── Reveal on scroll ───────────────────────────── */
        var revealTargets = document.querySelectorAll(
            '.hero .reveal, .project, .service, .method-card, .num, .also-note'
        );

        // Stagger siblings within each group before observing
        ['.numbers-grid > .num', '.method-grid > .method-card', '.service-list > .service']
            .forEach(function (sel) {
                document.querySelectorAll(sel).forEach(function (el, i) {
                    el.style.transition =
                        'opacity .7s var(--ease), transform .7s var(--ease), ' +
                        'border-color .35s var(--ease), background .3s var(--ease), ' +
                        'padding-left .35s var(--ease)';
                    el.style.transitionDelay = (Math.min(i, 5) * 70) + 'ms';
                });
            });

        if (reduceMotion || !('IntersectionObserver' in window)) {
            revealTargets.forEach(function (el) {
                el.classList.add('in');
                el.style.opacity = '';
                el.style.transform = '';
            });
        } else {
            // Hidden state lives in CSS (.project/.service/... start hidden);
            // .in flips it. Never inline opacity — that would override the class.
            document.querySelectorAll('.project, .service, .method-card, .num, .also-note')
                .forEach(function (el) { el.classList.add('will-reveal'); });

            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        io.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

            revealTargets.forEach(function (el) { io.observe(el); });

            // Safety net: never leave content invisible if IO misbehaves
            setTimeout(function () {
                revealTargets.forEach(function (el) { el.classList.add('in'); });
            }, 2500);
        }

        /* ── Active nav link ────────────────────────────── */
        var sections = Array.prototype.slice.call(
            document.querySelectorAll('main section[id]')
        );
        var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

        function setActive() {
            var y = window.scrollY + 140;
            var current = sections.length ? sections[0].id : null;

            sections.forEach(function (sec) {
                if (sec.offsetTop <= y) current = sec.id;
            });

            navLinks.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            });
        }
        setActive();
        window.addEventListener('scroll', setActive, { passive: true });

        /* ── Footer year ────────────────────────────────── */
        var year = document.getElementById('year');
        if (year) year.textContent = String(new Date().getFullYear());

        /* ── Contact form ───────────────────────────────── */
        var form = document.getElementById('contactForm');
        var status = document.getElementById('formStatus');

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                var name = form.name.value.trim();
                var email = form.email.value.trim();
                var message = form.message.value.trim();

                [[form.name, name], [form.email, email]].forEach(function (pair) {
                    pair[0].closest('.field').classList.remove('invalid');
                });

                if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                    if (!name) form.name.closest('.field').classList.add('invalid');
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                        form.email.closest('.field').classList.add('invalid');
                    }
                    if (status) status.textContent = 'Please add a name and a valid email address.';
                    return;
                }

                var subject = form.subject.value.trim() || 'Quantum enquiry';
                var body = message || '(no detail provided)';

                window.location.href =
                    'mailto:quantum@reneejulian.com' +
                    '?subject=' + encodeURIComponent('[Renee Julian] ' + subject) +
                    '&body=' + encodeURIComponent(
                        'Name: ' + name + '\nEmail: ' + email + '\n\n' + body
                    );

                if (status) {
                    status.textContent =
                        'Opening your email client — if nothing happens, write to quantum@reneejulian.com.';
                }
                form.reset();
            });

            form.addEventListener('input', function (e) {
                var field = e.target.closest('.field');
                if (field) field.classList.remove('invalid');
            });
        }
    });
})();
