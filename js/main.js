// IRO 香色 官網共用互動
(function () {
  var CONTACT_EMAIL = 'sancola1219@gmail.com'; // TODO: 之後換成品牌專用信箱

  // 手機版選單
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 共用：mailto 送出 + 備援複製區
  function sendViaMailto(form, subject, body) {
    var fallback = form.parentElement.querySelector('.form-fallback');
    if (fallback) {
      var ta = fallback.querySelector('textarea');
      if (ta) ta.value = '主旨：' + subject + '\n\n' + body;
      fallback.classList.add('show');
    }
    window.location.href =
      'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body.replace(/\n/g, '\r\n'));
  }

  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  // 聯絡表單
  var contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var subject = '【IRO 香色】來自 ' + fieldValue(contactForm, 'name') + ' 的訊息';
      var body = [
        '姓名：' + fieldValue(contactForm, 'name'),
        '電話：' + fieldValue(contactForm, 'phone'),
        'Email：' + fieldValue(contactForm, 'email'),
        '',
        '訊息內容：',
        fieldValue(contactForm, 'message'),
      ].join('\n');
      sendViaMailto(contactForm, subject, body);
    });
  }

  // 訂購單：動態品項列 + mailto 送出
  var orderForm = document.querySelector('.js-order-form');
  if (orderForm) {
    var itemsBox = orderForm.querySelector('.order-items');
    var addBtn = orderForm.querySelector('.add-item-btn');
    var template = itemsBox.querySelector('.order-item');

    function bindRemove(row) {
      row.querySelector('.remove-item').addEventListener('click', function () {
        var rows = itemsBox.querySelectorAll('.order-item');
        if (rows.length > 1) {
          row.remove();
        } else {
          row.querySelectorAll('input, select').forEach(function (el) { el.value = ''; });
        }
      });
    }
    bindRemove(template);

    addBtn.addEventListener('click', function () {
      var clone = template.cloneNode(true);
      clone.querySelectorAll('input, select').forEach(function (el) {
        el.value = el.name === 'item-qty' ? '1' : '';
      });
      itemsBox.appendChild(clone);
      bindRemove(clone);
    });

    // 從產品頁帶入品名（order.html?scent=晨霧）
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('scent');
    if (preset) {
      var firstSelect = template.querySelector('select[name="item-scent"]');
      if (firstSelect) {
        for (var i = 0; i < firstSelect.options.length; i++) {
          if (firstSelect.options[i].text.indexOf(preset) !== -1) {
            firstSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [];
      orderForm.querySelectorAll('.order-item').forEach(function (row, idx) {
        var scent = row.querySelector('[name="item-scent"]').value;
        var size = row.querySelector('[name="item-size"]').value;
        var qty = row.querySelector('[name="item-qty"]').value.trim();
        if (scent) {
          lines.push('品項 ' + (idx + 1) + '：' + scent +
            (size ? '｜' + size : '') +
            (qty ? '｜數量：' + qty : ''));
        }
      });
      var subject = '【IRO 香色 訂購單】' + fieldValue(orderForm, 'name');
      var body = [
        '姓名：' + fieldValue(orderForm, 'name'),
        '電話：' + fieldValue(orderForm, 'phone'),
        'Email：' + fieldValue(orderForm, 'email'),
        '收件地址：' + fieldValue(orderForm, 'address'),
        '',
        '訂購品項：',
        lines.join('\n'),
        '',
        '備註：',
        fieldValue(orderForm, 'message'),
      ].join('\n');
      sendViaMailto(orderForm, subject, body);
    });
  }

  // 首頁形象輪播
  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = carousel.querySelectorAll('.slide');
    var dots = carousel.querySelectorAll('.dots button');
    var current = 0;
    var timer = null;

    function show(i) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function start() { timer = setInterval(function () { show(current + 1); }, 4500); }
    function restart() { clearInterval(timer); start(); }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { show(i); restart(); });
    });
    start();
  }

  // 進場動畫
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    // 保底：無論如何 2.5 秒後全部顯示，避免任何環境下內容卡在隱形狀態
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // 頁尾年份
  var year = document.querySelector('.js-year');
  if (year) year.textContent = new Date().getFullYear();
})();
