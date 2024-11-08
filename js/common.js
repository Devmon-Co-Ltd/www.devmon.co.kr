var gnbActive;
var lnbActive;
var subLnbActive;

$(function () {
    $('.gnb > li').on('mouseenter', function () {
        $(this).children('.depth_bg').stop(true, true).slideDown(0);
    });

    $('.gnb > li').on('mouseleave', function () {
        var $this = $(this);
        
        setTimeout(function () {
            if (!$this.is(':hover') && !$this.children('.depth_bg').is(':hover')) {
                $this.children('.depth_bg').stop(true, true).slideUp(0);
            }
        },100); 
    });

    $('.depth_bg').on('mouseenter', function () {
        $(this).stop(true, true).slideDown(0);
    });

    $('.depth_bg').on('mouseleave', function () {
        var $this = $(this);

        setTimeout(function () {
            if (!$this.is(':hover') && !$this.closest('li').is(':hover')) {
                $this.stop(true, true).slideUp(0);
            }
        },100);
    });
    
    /**
   * @description
   * 	click layer open event
   */

    //레이어 열기
    $(document).on('click', '[class*="btn-pop"]', function (e) {
        if (!$(e.target).is('input[type="text"]')) {
            popOpen(e);
        }
    });

    //레이어 닫기
    $(document).on('click', '.popup .pop-close', function (e) {
        popClose(e);
    });

    /**
   * @description
   * 	keydown event
   * 		esc 활성화
   */

    $(document).on('keydown', function (e) {
        // var target = $(e.target);
        if (e.keyCode === 27) {
            //esc
            if ($('.filt_box').hasClass('on')) {
                filterClose();
            }

            // 팝업 esc로 닫기
            let  $body = $('body, html');
            var $popBox = $('.popup').not('.dragpop');
            if ($body.css('overflow') === 'hidden') {
                $body.css('overflow', 'visible');
                $('#wrap').removeAttr('style');
                if ($popBox.hasClass('on')) {
                    $popBox
                        .find('.pop-close')
                        .trigger('click');
                    
                }
            }

            var $activePopup = $('.popup.on');

            // 팝업 내용이 다른 파일로 분리된 경우 datepicker 에서 오류발생 -> 정확하게 열린 팝업의 취소버튼을 찾아 trigger
            if ($activePopup.length > 1) {

                var idx = 0;

                $activePopup.each(function () {
                    var $this = $(this),
                        thisIdx = $this.css('z-index');

                    if (idx < thisIdx) {
                        idx = thisIdx;
                        $activePopup = $this;
                    }
                });
            }

            var $popClose = $activePopup
                .not('.dragpop')
                .find('.pop-close');

            // popClose 클래스가 두 개 있는경우 충돌되는 오류 방지
            if ($popClose.length >= 2) {
                $popClose
                    .eq(1)
                    .trigger('click');
            } else {
                $popClose
                    .eq(0)
                    .trigger('click');
            }
        }
    });

    // enterEventListener();

});

/**
* popOpen
* @description
* 	레이어 팝업 열기
*/
var currentTop = 0;

function popOpen(e, popCls, callback) {
    var popName;
    var $dim = $('.dimmed');

    if (e !== null) {

        var target = $(e.currentTarget);

        //현재 클릭한 버튼 찾기
        var btnCls = target.attr('class');

        //버튼 클래스와 매치되는 팝업클래스 찾기
        var btnName = target
            .attr("class")
            .split(" ");

        $.each(btnName, function (idx, str) {
            if (str.match("pop")) {
                btnCls = str;
            }
            
        });

        popName = btnCls.replace("btn-", "")
    } else {
        popName = popCls;
    }

    //팝업 노출
    var $popUp = $("." + popName),
        hasPopCls = $popUp.attr('class'),
        hasDual = $popUp.hasClass('dualpop'),
        hasMany = $popUp.hasClass('manypop'),
        hasDrag = $popUp.hasClass('dragpop');

    if (!hasDual) {
        //듀얼 레이어가 아닐경우

        if (!hasMany) {
            //팝업을 여러개 노출하지 않는 경우 이미 노출되어있는 팝업 노출해제
            popClose(e);
            $('.popup').each(function () {
                var hasOn = $(this).hasClass(popName);
                if (!hasOn) {
                    var closeCls = $(this)
                        .context
                        // .classList[1];
                    // var closeCls = $(this).context;

                    popClose(null, closeCls);
                }
            });
        }

        // 팝업을 여러개 노출하는 경우 data-idx attribute를 설정하여 z-index 제어
        if (hasMany) {
            var manyPopCount = $('.manypop.on').length;

            $popUp.attr('data-idx', manyPopCount);
            $dim.attr('data-idx', manyPopCount);
        }

        //centerPop 선언 위치에 따라서 vertical center여부가 달라짐
        if (hasDrag) {
            //드래그 가능한 팝업의 경우 centerPop을 우선 선언
            centerPop();
            $popUp.addClass('on');
            //			$dim.addClass('on');
        } else {
            //일반 팝업인 경우 centerPop을 나중에 선언
            $popUp.addClass('on');
            $dim.addClass('on');
            centerPop();
        }

        //스크롤바 있는 경우에만 스크롤바 숨기기
        if ($(document).height() > $(window).height()) {
            //스크롤 위치는 그대로
            currentTop = $(window).scrollTop();

            //스크롤바 숨기기
            $('body, html').addClass('layer-open');

            //body에 overflow:hidden할 경우 scrollTop이 0으로 되는 현상 수정
            $('#wrap').css({
                'position': 'fixed',
                'top': -currentTop
            });

            //$(window).scrollTop(currentTop);
        }

    } else if (hasDual) {
        //듀얼 레이어인 경우

        if (!$popUp.hasClass('on')) {
            //이미 노출된 듀얼 레이어가 아닐 경우에만 centerPop적용
            centerPop();
        }

        $popUp.addClass('on');
    }

    //함수 불러오기
    if (callback) {
        callback();
    }
}

/**
* popClose
* @description
* 	레이어 팝업 닫기
*/
function popClose(e, popCls) {
    var $popBox;
    let $dim = $('.dimmed');
    let  $body = $('body, html');

    if (e !== null) {
        var target = $(e.target),
            $popBox = target.parents('.popup');

    } else {
        $popBox = $("." + popCls);
    }

    //레이어팝업 노출 삭제
    $popBox.removeClass('on');

    // dimmed 노출 삭제
    if ($popBox.hasClass('manypop')) {
        // 팝업 위에 팝업인 경우 idx값에 따라 dimmed에 있는 data-idx 숫자를 변경하거나 삭제처리
        var dimIdx = $('.manypop.on').length - 1;

        if (dimIdx < 0) {
            // idx가 0보다 작을 경우 dim삭제
            $dim
                .attr('data-idx', 0)
                .removeClass('on');
        } else {
            // idx 변경
            $dim.attr('data-idx', dimIdx);
        }
    } else {
        $dim.removeClass('on');
    }

    // 숨긴 스크롤바 보이기
    if ($body.css('overflow') === 'hidden') {
        $body.css('overflow', 'visible');
        $('#wrap').removeAttr('style');
    }
    if ($body.hasClass('layer-open')) {
        $body.removeClass('layer-open');
        $('#wrap').removeAttr('style');
        $(window).scrollTop(currentTop);
    }
}
/**
 * resize
 * @description
 * 	윈도우 창 넓이 변화에 따라 레이어팝업 중앙 정렬
 *
 */
var delta = 100;
var timer = null;
$(window).on('resize', function (e) {
    //300밀리초마다 resize실행 여부를 확인
    clearTimeout(timer);
    timer = setTimeout(resizeDone, delta);
});

//resize가 끝날 경우 실행
function resizeDone() {
    centerPop();
}

//팝업 중앙 정렬
function centerPop() {
    var $popBox = $('.popup');

    $.each($popBox, function () {
        var $this = $(this);

        // resize가 되어도 scrollTop값 유지
        var wrapTop = Math.abs($('#wrap').css('top').replace('px', ''));
        var scrollTop = $(window).scrollTop();

        if (wrapTop > 0) {
            scrollTop = wrapTop;
        }

        var winWidth = $(window).outerWidth(),
            winHeight = $(window).outerHeight(),
            //window에서 center
            tx = (winWidth - $this.outerWidth()) / 2,
            ty = (winHeight - $this.outerHeight()) / 2 + scrollTop;

        var hasOn = $this.hasClass('on'),
            hasDual = $this.hasClass('dualpop'),
            hasDrag = $this.hasClass('dragpop'),
            hasMany = $this.hasClass('manypop');

        if (hasOn && !hasDual && !hasDrag) {
            //듀얼 레이어가 아닌 경우 center정렬
            $this.css({
                top: ty + 'px',
                left: tx + 'px'
            });

        } else if (!hasOn && hasDrag) {
            //듀얼 레이어가 아니고 드래그만 가능한 경우 center정렬(기존에 노출된 레이어 위치는 그대로 유지)

            $this.css({
                top: ty + 'px',
                left: tx + 'px'
            });

        } else if (hasDual && winWidth <= 1280) {
            //1280 이하 듀얼 레이어 정렬

            if (!hasOn) {
                //기존에 노출된 레이어가 아닐 경우 가운데 정렬
                $this.css({
                    top: ty + 'px',
                    left: tx + 'px'
                });
            }

        } else if (!hasOn && hasDual && winWidth >= 1280) {
            //1280 이상 듀얼 레이어 위치 초기화(기존에 노출된 레이어 위치는 그대로 유지)

            $this.removeAttr('style');
        }
    });
}

var ui = {
	makeModalHtmlSource: function(isConfirm, title, message, confirmButtonName, cancelButtonName) {
		var html = '';
		html += '<div class="popup pop-window-alert w600p on">';
		html += '	<div class="pop-head">';
		html += '		<h2 class="pop-tit flex-l">' + title + '</h2>';
		html += '		<a class="btn-close btn-window-close">';
		html += '			<em class="fa-solid fa-xmark" aria-hidden="true"></em>';
		html += '		</a>';
		html += '	</div>';
		html += '	<div class="pop-body line15 txt-cent">';
		html += '		<p>' + message + '</p>';
		html += '		<div class="btn-wrap flex-c">';
		
		if (isConfirm) {
			html += '			<button type="button" class="btn-base pointer btn-window-confirm flex-c"><span>' + confirmButtonName + '</span></button>';
			html += '			<button type="button" class="btn-base pointer btn-window-close flex-c rev mleft10"><span>' + cancelButtonName + '</span></button>';
		} else {
			html += '			<button type="button" class="btn-base pointer btn-window-close flex-c"><span>' + cancelButtonName + '</span></button>';
		}
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	defaultCloseEvent: function() {
		if ($('.popup.on').length <= 1) {
			$('.dimmed').removeClass('on');
		}
		$('.pop-window-alert').find('.btn-window-confirm').off();
		$('.pop-window-alert').find('.btn-window-close').off();
		$('.pop-window-alert').remove();
	},
	getSettings: function(options, isConfirm) {
		return {
			parents: options.parents || '.content',
			title: options.title || 'Confirm',
			message: options.message || '',
			confirmButtonName: options.confirmButtonName || 'Yes',
			cancelButtonName: options.cancelButtonName || (isConfirm ? 'No' : 'Done'),
			confirmEvent: options.confirm || function() { return true; },
			cancelEvent: options.cancel || function() { return false; }
		};
	},
	
	/*
	 * 사용 예시
	 * 	ui.confirm({
	 *		title: 'Save',
	 *		message: '정말로 저장하시겠습니까?',
	 *		confirm: function() {
	 *			console.log('저장하였습니다.');
	 *		}
	 *	});
	 */
	confirm: function(options) {
		var settings = this.getSettings(options);
		
		var source = ui.makeModalHtmlSource(true, settings.title, settings.message, settings.confirmButtonName, settings.cancelButtonName);
		$(settings.parents).append(source);
		popOpen(null, 'pop-system-alert');
	
		$('.pop-window-alert').find('.btn-window-confirm').on('click', function() {
			ui.defaultCloseEvent();
			settings.confirmEvent();
		});
	
		$('.pop-window-alert').find('.btn-window-close').on('click', function() {
			ui.defaultCloseEvent();
			settings.cancelEvent();
		});
	},
	alert: function(options) {
		var settings = this.getSettings(options);

		var source = ui.makeModalHtmlSource(false, settings.title, settings.message, settings.confirmButtonName, settings.cancelButtonName);
		$(settings.parents).append(source);
		popOpen(null, 'pop-system-alert');
	
		$('.pop-window-alert').find('.btn-window-close').on('click', function() {
			ui.defaultCloseEvent();
			settings.cancelEvent();
		});
	}
};