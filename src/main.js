import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import 'jquery-countto';
import 'slick-carousel';
import device from 'current-device';
import {jarallax} from 'jarallax';
import '@fancyapps/fancybox';


'use strict';
(function() {
    /*-- Global variables --*/
    var nHtmlNode = document.documentElement,
        nBodyNode = document.body || document.getElementsByTagName('body')[0],
        nAppNode  = document.getElementById('app'),
        nHeader   = document.getElementById('top-bar'),
        nHero     = document.getElementById('start-screen') || document.getElementById('hero'),


        jWindow   = $(window),
        jBodyNode = $(nBodyNode),
        jAppNode  = $(nAppNode),
        jHeader   = $(nHeader),
        jHero     = $(nHero),

        iHeaderHeight = 0,
        bNavAnchor    = jHeader.data('nav-anchor') === true ? true : false,
        bMenuOpen     = false,

        animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

        rAF = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame||
            function (callback) {
                setTimeout(callback, 1000 / 60);
            };

    var scrollBarWidth = parseInt(window.innerWidth - nHtmlNode.clientWidth);

    function _showScroll ()
    {
        nHtmlNode.style.overflow = '';
        nHeader.style.right = '';
    };

    function _hideScroll ()
    {
        nHtmlNode.style.overflow = 'hidden';
        nHeader.style.right = scrollBarWidth + 'px';
    };

    /* scroll animate
    ================================================== */
    AOS.init({
        offset: 120,
        delay: 100,
        duration: 450, // or 200, 250, 300, 350.....
        easing: 'ease-in-out-quad',
        once: true,
        disable: 'mobile'
    });

    /* header
    ================================================== */
    function _header ()
    {
        var nMenu          = document.getElementById('top-bar__navigation'),
            nMenuToggler   = document.getElementById('top-bar__navigation-toggler'),

            jMenu          = $(nMenu),
            jMenuToggler   = $(nMenuToggler),

            jMenuLink      = jMenu.find('li a'),
            jSubmenu       = jMenu.find('.submenu'),
            bHeaderSticky  = false,
            updatePosition = function ()
            {
                var iTop = jHero.innerHeight() - iHeaderHeight;

                if ( (window.pageYOffset || document.documentElement.scrollTop) >= iTop )
                {
                    if ( !bHeaderSticky )
                    {
                        jHeader
                            .off(animationEnd)
                            .addClass('is-sticky in')
                            .one(animationEnd, function(e){
                                jHeader.removeClass('in');
                            });

                        bHeaderSticky = !bHeaderSticky;
                    };
                }
                else if ( bHeaderSticky )
                {
                    jHeader
                        .addClass('out')
                        .off(animationEnd)
                        .one(animationEnd, function(e){
                            jHeader.removeClass('is-sticky out');
                        });

                    bHeaderSticky = !bHeaderSticky;
                };
            },
            hideMobileMenu = function ()
            {
                if ( window.innerWidth > 1199 && bMenuOpen )
                {

                    jHeader.removeClass('is-expanded');
                    jMenuToggler.removeClass('is-active');
                    jSubmenu.removeAttr('style');
                    nHtmlNode.style.overflow = '';
                    bMenuOpen = false;
                }
            };

        iHeaderHeight = jMenuToggler.is(':visible') ? 65 : 90;

        if ( bNavAnchor )
        {
            jBodyNode.scrollspy({
                target: nHeader,
                offset: iHeaderHeight + 1
            });
        };

        if ( jSubmenu.length > 0 )
        {
            jSubmenu.parent('li').addClass('has-submenu');
        };

        jMenuToggler.on('touchend click', function (e) {
            e.preventDefault();

            var $this = $(this);

            if ( bMenuOpen )
            {
                $this.removeClass('is-active');
                jHeader.removeClass('is-expanded');
                nHtmlNode.style.overflow = '';
                bMenuOpen = !bMenuOpen;
            }
            else
            {
                $this.addClass('is-active');
                jHeader.addClass('is-expanded');
                nHtmlNode.style.overflow = 'hidden';
                bMenuOpen = !bMenuOpen;
            };

            return false;
        });

        jMenuLink.on('click', function (e) {

            var $this       = $(this),
                $parent     = $this.parent(),
                bHasSubmenu = $this.next(jSubmenu).length ? true : false;

            if ( bMenuOpen && bHasSubmenu )
            {
                if ( $this.next().is(':visible') )
                {
                    $parent.removeClass('drop_active');
                    $this.next().slideUp('fast');

                } else {

                    $this.closest('ul').find('li').removeClass('drop_active');
                    $this.closest('ul').find('.submenu').slideUp('fast');
                    $parent.addClass('drop_active');
                    $this.next().slideDown('fast');
                };

                return false;
            };
        });

        jWindow
            .on('scroll', throttle(updatePosition, 100)).scroll()
            .on('resize', debounce(hideMobileMenu, 100));
    };

    /* choose lang
    ================================================== */
    function _chooseLang ()
    {
        var chooseLang = $('.js-choose-lang');

        if ( chooseLang.length > 0 )
        {
            var currLang = chooseLang.children('.current-lang'),
                currFlag = currLang.find('img'),
                currName = currLang.find('span'),

                langList  = chooseLang.children('.list-wrap'),
                listItem  = langList.find('li');

            currLang.on('click', function (e)
            {
                var $this = $(this),
                    img = $this.find('img');

                chooseLang.addClass('is-active');

                langList.slideToggle();
            });

            listItem.on('click', function (e)
            {
                var $this = $(this),
                    name  = $this.attr('data-short-name'),
                    flag  = $this.attr('data-img');;

                listItem.removeClass('is-active');
                $this.addClass('is-active');

                currFlag.attr('src', flag);
                currName.text(name);

                langList.delay(300).slideUp(function () {
                    chooseLang.removeClass('is-active');
                });

                return false;
            });
        };
    };

    /* side menu toggle
    ================================================== */
    function _sideMenuToggle ()
    {
        var isVisible = false,
            isActive  = false,
            nSideMenu = document.getElementById('side-menu'),

            jSideMenu = $(nSideMenu),
            jBtnOpen  = $('.js-side-menu-open'),
            jBtnClose = $('.js-side-menu-close');

        jBtnOpen.on('touchend click', function () {

            if ( !isVisible )
            {
                // first click
                jSideMenu.removeClass('d-none').delay(100).queue(function () {
                    $(this).addClass('is-active').dequeue();
                });
            }
            else
            {
                jSideMenu.addClass('is-active');
            }

            isVisible = true;
            isActive  = true;

            return false;
        });

        jBtnClose.on('touchend click', function () {

            jSideMenu.removeClass('is-active');

            isActive = false;

            return false;
        });

        jWindow.on('scroll', throttle(function() {

            if ( isActive )
            {
                jSideMenu.removeClass('is-active');

                isActive = false;
            };

        }, 500));
    };

    /* tilt
    ================================================== */
    function _tilt ()
    {
        if ( 'function' !== typeof VanillaTilt ) return console.error( "Error: VanillaTilt is not a function. Be sure to include 'vanilla-tilt.js'");

        var nTilt = document.querySelectorAll(".js-tilt");

        if ( device.desktop() && nTilt.length > 0 )
        {
            VanillaTilt.init(nTilt);
        };
    };

    /* parallax
    ================================================== */
    function _parallax ()
    {
        if ( 'function' !== typeof jarallax ) return console.error( "Error: jarallax is not a function. Be sure to include 'jarallax.js'");

        var nJarallax = document.querySelectorAll('.jarallax');

        if ( device.desktop() && nJarallax.length > 0 )
        {
            jarallax(nJarallax, {
                type: 'scroll', // scroll, scale, opacity, scroll-opacity, scale-opacity
                zIndex: -20
            });
        };
    };

    /* isotope sorting
    ================================================== */
    function _isotopeSorting ()
    {
        var jOptionSets = $('.js-isotope-sort');

        if ( jOptionSets.length > 0 )
        {
            jOptionSets.each(function ( i, optionSet ) {
                var $this         = $( optionSet ),
                    jOptionLinks  = $this.find('a'),
                    jIsoContainer = $this.siblings('.js-isotope');

                jOptionLinks.on('click', function(e) {
                    var currentLink   = $(this),
                        currentOption = currentLink.data('cat');

                    $this.find('.selected').removeClass('selected');
                    currentLink.addClass('selected');

                    if (currentOption !== '*') {
                        currentOption = '.' + currentOption;
                    }

                    jIsoContainer.isotope({filter : currentOption});

                    return false;
                });
            });
        };
    };

    /* slick slider
    ================================================== */
    function _slickSlider ()
    {
        if ( !$.fn.slick ) return console.error( "Error: slick is not a function. Be sure to include 'slick.js'");

        var jSlider = $('.js-slick');

        if ( jSlider.length > 0 )
        {
            jSlider.each(function ( i, slider ) {
                var $this = $( slider );

                $this.on('init', function(event, slick){

                }).slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
                    adaptiveHeight: true,
                    dots: true,
                    arrows: false,
                    speed: 800,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    touchThreshold: 15,
                    prevArrow: '<i class="fontello-angle-left slick-prev"></i>',
                    nextArrow: '<i class="fontello-angle-right slick-next"></i>'
                });
            });
        };
    };

    /* lightbox
    ================================================== */
    function _fancybox ()
    {
        if ( !$.fn.fancybox ) return console.error( "Error: fancybox is not a function. Be sure to include 'fancybox.js'");

        var galleryElement = $("a[data-fancybox]");

        if ( galleryElement.length > 0 )
        {
            $("[data-fancybox]").fancybox({
                parentEl: nAppNode,
                buttons : [
                    'slideShow',
                    'fullScreen',
                    'thumbs',
                    'close'
                ],
                loop : true,
                protect: true,
                wheel : false,
                transitionEffect : "tube",
                onInit: function (instance, slide, e) {

                    _hideScroll();
                },
                afterClose: function (instance, slide, e) {

                    _showScroll();
                }
            });
        }
    };

    /* accordion
    ================================================== */
    function _accordion ()
    {
        var oAccordion = $('.accordion-container');

        if ( oAccordion.length > 0 ) {

            var oAccItem    = oAccordion.find('.accordion-item'),
                oAccTrigger = oAccordion.find('.accordion-toggler');

            oAccordion.each(function ( i, accordion ) {
                $( accordion ).find('.accordion-item:eq(0)').addClass('active');
            });

            oAccTrigger.on('click', function (j) {
                j.preventDefault();

                var $this = $(this),
                    parent = $this.parent(),
                    dropDown = $this.next('article');

                parent.toggleClass('active').siblings(oAccItem).removeClass('active').find('article').not(dropDown).slideUp();

                dropDown.stop(false, true).slideToggle();

                return false;
            });
        };
    };

    /* tabs
    ================================================== */
    function _tabs ()
    {
        var oTab = $('.tab-container');

        if ( oTab.length > 0 ) {

            var oTabTrigger = oTab.find('.tab-nav__item');

            oTab.each(function ( i , tab ) {

                $( tab )
                    .find('.tab-nav__item:eq(0)').addClass('active').end()
                    .find('.tab-content__item:eq(0)').addClass('is-visible');
            });

            oTabTrigger.on('click', function (g) {
                g.preventDefault();

                var $this = $(this),
                    index = $this.index(),
                    parent = $this.closest('.tab-container');

                $this.addClass('active').siblings(oTabTrigger).removeClass('active');

                parent
                    .find('.tab-content__item.is-visible').removeClass('is-visible').end()
                    .find('.tab-content__item:eq(' + index + ')').addClass('is-visible');

                return false;
            });
        };
    };

    /* counters
    ================================================== */
    function _counters ()
    {
        var jCounter = $('.js-count');

        function _countInit() {
            jCounter.each(function( i, counter ) {
                var $this = $( counter );

                if( $this.is_on_screen() && !$this.hasClass('animate') )
                {
                    $this
                        .addClass('animate')
                        .countTo({
                            from: 0,
                            speed: 2000,
                            refreshInterval: 100
                        });
                };
            });
        };

        if ( jCounter.length > 0 )
        {
            _countInit();

            jWindow.on('scroll', throttle(function(e) {

                // _countInit();

                if( rAF ) {
                    rAF(function(){
                        _countInit();
                    });
                } else {
                    _countInit();
                }

            }, 400));
        };
    };

    /* google map
    ================================================== */
    function _g_map ()
    {
        var maps = $('.g_map');

        if ( maps.length > 0 )
        {
            var apiKey = maps.attr('data-api-key'),
                apiURL;

            if (apiKey)
            {
                apiURL = 'http://maps.google.com/maps/api/js?key='+ apiKey +' &sensor=false';
            }
            else
            {
                apiURL = 'http://maps.google.com/maps/api/js?sensor=false';
            }

            $.getScript( apiURL , function( data, textStatus, jqxhr ) {

                maps.each(function() {
                    var current_map = $(this),
                        latlng = new google.maps.LatLng(current_map.attr('data-longitude'), current_map.attr('data-latitude')),
                        point = current_map.attr('data-marker'),

                        myOptions = {
                            zoom: 14,
                            center: latlng,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            mapTypeControl: false,
                            scrollwheel: false,
                            draggable: true,
                            panControl: false,
                            zoomControl: false,
                            disableDefaultUI: true
                        },

                        stylez = [
                            {
                                featureType: "all",
                                elementType: "all",
                                stylers: [
                                    { saturation: -100 } // <-- THIS
                                ]
                            }
                        ];

                    var map = new google.maps.Map(current_map[0], myOptions);

                    var mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" });
                    map.mapTypes.set('Grayscale', mapType);
                    map.setMapTypeId('Grayscale');

                    var marker = new google.maps.Marker({
                        map: map,
                        icon: {
                            size: new google.maps.Size(59,69),
                            origin: new google.maps.Point(0,0),
                            anchor: new google.maps.Point(0,69),
                            url: point
                        },
                        position: latlng
                    });

                    google.maps.event.addDomListener(window, "resize", function() {
                        var center = map.getCenter();
                        google.maps.event.trigger(map, "resize");
                        map.setCenter(center);
                    });
                });
            });
        };
    };

    /* scrollTo
    ================================================== */
    function _scrollTo ()
    {
        var jLink = $('a[href*="#"]').not('[href="#"]').not('[href="#0"]'),
            nMenuToggler = document.getElementById('top-bar__navigation-toggler'),
            jMenuToggler = $(nMenuToggler);

        jLink.on('touchend click', function (e) {

            var $this = $(this).blur();

            if ( location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname )
            {
                var target = $(this.hash);

                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

                if ( target.length )
                {
                    $('html,body').stop().animate({
                        scrollTop: target.offset().top - iHeaderHeight
                    }, 1000);
                };

                if ( bNavAnchor && bMenuOpen )
                {
                    jMenuToggler.click();
                };

                return false;
            };
        });
    };

    /* scroll to top
    ================================================== */
    function _scrollTop ()
    {
        var	nBtnToTopWrap = document.getElementById('btn-to-top-wrap'),
            jBtnToTopWrap = $(nBtnToTopWrap);

        if ( jBtnToTopWrap.length > 0 )
        {
            var nBtnToTop = document.getElementById('btn-to-top'),
                jBtnToTop = $(nBtnToTop),
                iOffset   = jBtnToTop.data('visible-offset');

            jBtnToTop.on('click', function (e) {
                e.preventDefault();

                $('body,html').stop().animate({ scrollTop: 0 } , 1500);

                return false;
            });

            jWindow.on('scroll', throttle(function(e) {

                if ( jWindow.scrollTop() > iOffset )
                {
                    if ( jBtnToTopWrap.is(":hidden") )
                    {
                        jBtnToTopWrap.fadeIn();
                    };

                }
                else
                {
                    if ( jBtnToTopWrap.is(":visible") )
                    {
                        jBtnToTopWrap.fadeOut();
                    };
                };

            }, 400)).scroll();
        };
    };

    /* contact form
    ================================================== */
    function _contactForm ()
    {
        var jForm = $('.js-contact-form');

        if ( jForm.length > 0 )
        {
            jForm.each(function ( i, form ) {
                var $this = $( form );

                $this.on('submit', function() {
                    var $this = $(this),
                        str = $this.serialize(),
                        note = $this.find('.form__note');

                    $.ajax({
                        type: "POST",
                        url: "send_mail/contact_process.php",
                        data: str,
                        success: function(msg) {

                            var result = '<span style="color: green"><br/>Your message has been sent. Thank you!</span>';

                            note.html(result);

                            $this.get(0).reset();

                            setTimeout(function() { note.html(''); }, 3000);
                        },
                        error: function(err) {
                            var result = '<span style="color: red"><br/>Your message not sent! Error: "'+err.responseJSON.message+'"</span>';

                            note.html(result);
                        },
                        complete: function() {
                        }
                    });

                    return false;
                });
            });
        };
    };

    $(document).ready(function() {

        /* header
        ================================================== */
        _header();

        /* choose lang
        ================================================== */
        _chooseLang();

        /* side menu toggle
        ================================================== */
        _sideMenuToggle();

        /* tilt
        ================================================== */
        _tilt();

        /* parallax
        ================================================== */
        _parallax();

        /* isotope sorting
        ================================================== */
        _isotopeSorting();

        /* slick slider
        ================================================== */
        _slickSlider();

        /* lightbox
        ================================================== */
        _fancybox();

        /* accordion
        ================================================== */
        _accordion();

        /* tabs
        ================================================== */
        _tabs();

        /* counters
        ================================================== */
        _counters();

        /* scroll to top
        ================================================== */
        _scrollTop();

        /* contact form
        ================================================== */
        _contactForm();
    });

    jWindow.on('load', function () {

        var jMasonry = $('.js-masonry');

        if ( jMasonry.length > 0 && $.fn.isotope )
        {
            jMasonry.masonry('layout');
        };

        /* scrollTo
        ================================================== */
        _scrollTo();

        /* google map
        ================================================== */
        _g_map();
    });

    $.fn.is_on_screen = function () {
        var viewport = {
            top: jWindow.scrollTop(),
            left: jWindow.scrollLeft()
        };
        viewport.right = viewport.left + jWindow.width();
        viewport.bottom = viewport.top + jWindow.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return ( !( viewport.right < bounds.left ||
            viewport.left > bounds.right ||
            viewport.bottom < bounds.top ||
            viewport.top > bounds.bottom
        ));
    };

    // Create a safe reference to the Underscore object for use below.
    function now() {
        return new Date().getTime();
    };

    function throttle(func, wait, options)
    {
        var timeout, context, args, result;
        var previous = 0;

        if (!options) options = {};

        var later = function later()
        {
            previous = options.leading === false ? 0 : now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function throttled()
        {
            var at = now();
            if (!previous && options.leading === false) previous = at;
            var remaining = wait - (at - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait)
            {
                if (timeout)
                {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = at;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
            else if (!timeout && options.trailing !== false)
            {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        throttled.cancel = function ()
        {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };

        return throttled;
    };

    //  Pure js debounce function to optimize resize method
    function debounce(func, wait, immediate)
    {
        var timeout;

        return function()
        {
            var context = this,
                args = arguments;

            clearTimeout(timeout);

            timeout = setTimeout(function() {
                timeout = null;

                if (!immediate) func.apply(context, args);
            }, wait);

            if (immediate && !timeout) func.apply(context, args);
        };
    };
}());


(function (w, d) {
    let m = d.getElementsByTagName('main')[0],
        s = d.createElement("script"),
        v = !("IntersectionObserver" in w) ? "8.17.0" : "12.0.0",
        o = {
            elements_selector: ".lazy",
            threshold: 500,
            callback_enter: function (element) {

            },
            callback_load: function (element) {

            },
            callback_set: function (element) {

                let oTimeout = setTimeout(function () {
                    clearTimeout(oTimeout);

                    AOS.refresh();
                }, 1000);
            },
            callback_error: function (element) {
                element.src = "https://placeholdit.imgix.net/~text?txtsize=21&txt=Image%20not%20load&w=200&h=200";
            }
        };
    s.type = 'text/javascript';
    s.async = false; // This includes the script as async. See the "recipes" section for more information about async loading of LazyLoad.
    s.src = "https://cdn.jsdelivr.net/npm/vanilla-lazyload@" + v + "/dist/lazyload.min.js";
    m.appendChild(s);
    // m.insertBefore(s, m.firstChild);
    w.lazyLoadOptions = o;
}(window, document));
