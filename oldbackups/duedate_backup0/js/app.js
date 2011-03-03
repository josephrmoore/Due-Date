jQuery(document).ready(function($){
	
// Globals
	var hasLocalStorage = false;
	var hasPreviousStorage = false;
	var hasPreviousCookie = false;
	
	function init(){
		checkStorage();
		if(hasLocalStorage == true){
			previousStorage();
		} else {
			previousCookie();
		}
	}
	
// Storage or Cookies
	function checkStorage(){
		if (typeof(localStorage) != 'undefined' ){
			try {
				localStorage.setItem("test", "local storage is working");
				localStorage.removeItem("test");
				hasLocalStorage = true;
				console.log('Local storage is working.');
			} catch (e) {
				if (e == QUOTA_EXCEEDED_ERR) {
					console.log('Quota exceeded!');
					hasLocalStorage = false;
				}
			}
		}
	}
	
	function previousCookie(){
		var date = checkCookie('duedate');
		var time = checkCookie('time');
		var name = checkCookie('name');
		var theme = checkCookie('theme');
		
		if (date !== false){
			hasPreviousCookie = true;
			if(theme !== null){
				var css = $('link')[1];
				$(css).attr('href', theme);
			}
			getPartial($('#content'), 'timer.html', function(){
				timerCode(date, time, name);
			});
		} else {
			getPartial($('#content'), 'form.html', formCode);
		}
		
		function checkCookie(name){
			var results = document.cookie.match ( '(^|;) ?' + name + '=([^;]*)(;|$)' );
			if (results) {
		    	return results;
			} else {
		    	return false;
			}
		}
	}
	
	function previousStorage(){
		var date = localStorage.getItem('duedate');
		var time = localStorage.getItem('time');
		var name = localStorage.getItem('name');
		var theme = localStorage.getItem('theme');
		
		if (date !== null){
			hasPreviousStorage = true;
			if(theme !== null){
				var css = $('link')[1];
				$(css).attr('href', theme);
			}
			getPartial($('#content'), 'timer.html', function(){
				timerCode(date, time, name);
			});
		} else {
			getPartial($('#content'), 'form.html', formCode);
		}
	}
	
	
// Form code
	function formCode(){
		var dateObj = $('#duedate');
		var nameObj = $('#babyname');
		
		if (hasPreviousStorage == true){
			dateObj.val(localStorage.getItem('duedate'));
			nameObj.val(localStorage.getItem('name'));
			if (localStorage.getItem('time') == 'morning'){
				$('#morning').attr('checked', 'checked');
			} else if (localStorage.getItem('time') == 'evening'){
				$('#evening').attr('checked', 'checked');
			}
		}
		
		if(!Modernizr.inputtypes.date){
			$('input[type=date]').each(function() {
				var $input = $(this);
				$input.datepicker({
					dateFormat: 'yy-mm-dd'
				});
			});			
		};
		
		var form = $('#enterDate');
		
		form.submit(function(e){
			e.preventDefault();
			
			var date = dateObj.val();
			var time = $('#timeOfDay input:radio:checked').val();
			var name = nameObj.val();

			if(hasLocalStorage == true){
				localStorage.setItem('duedate', date);
				localStorage.setItem('time', time);
				localStorage.setItem('name', name);
				hasPreviousStorage = true;
			} else {
				// might overwrite...
				setCookie('duedate', date, 300);
				setCookie('time', time, 300);
				setCookie('name', name, 300);
				hasPreviousCookie = true;
			}
			
			getPartial($('#content'), 'timer.html', function(){
				timerCode(date, time, name);
			});
			return false;
		});
		
		function setCookie(cookieName, cookieValue, nDays){
			var today = new Date();
			var expire = new Date();
			if (nDays==null || nDays==0) nDays=1;
			expire.setTime(today.getTime() + 3600000*24*nDays);
			var cook = cookieName+"="+escape(cookieValue)+ ";expires="+expire.toGMTString();
			document.cookie = cook;
			console.log(cook);
		}
		
		$('#timeOfDay input:radio').change(function(){
			$(this).attr('checked', 'checked');
			if(hasLocalStorage == true){
				localStorage.setItem('time', $(this).val());
			} else {
				// might overwrite...
				setCookie('time', $('#timeOfDay input:checked').val(), 300);
			}
		});
		
		$("label.overlayed")
		.inFieldLabels({fadeDuration:150, fadeOpacity:0.4})
		.bind('click focus', function(){
			$('#'+$(this).attr('for')).focus();
		});
		
	}

// Timer code

	function timerCode(date, time, name){
		
		if (time==='morning'){
			time = 9;
		} else if (time=='afternoon'){
			time = 14;
		} else if (time=='evening'){
			time = 19;
		}
		
		if (localStorage.getItem('theme') == 'css/blue.css'){
			$('#blue').attr('checked', 'checked');
		} else if (localStorage.getItem('theme') == 'css/pink.css'){
			$('#pink').attr('checked', 'checked');
		}
		
		writeTimer(date, time, name);
		
		var interval = setInterval(function(){			
			writeTimer(date, time, name);
		}, 1000);
		
		function calculateDueDate(duedate, time){
			var date = duedate.split('-');
			due = new Date(date[0], (date[1]-1), date[2], time);
			now = new Date();
			mDue = due.getTime();
			mNow = now.getTime();

			var totalSeconds = Math.floor((mDue-mNow)/1000);
			var seconds = totalSeconds%60;
			var totalMinutes = (totalSeconds-seconds)/60;
			var minutes = totalMinutes%60;
			var totalHours = (totalMinutes-minutes)/60;
			var hours = totalHours%24;
			var totalDays = (totalHours-hours)/24;

			var currmonth = parseInt(now.getMonth()) + 1;
			var curryear = parseInt(now.getFullYear());
			var days = totalDays;
			var months = 0;

			while(checkDays()){
				if(is30()){		
					days -= 30;
					++currmonth;
					++months;
				} else if (is31()){
					days -= 31;
					if(currmonth == 12){
						currmonth = 1;
						++months;
						++curryear;
					} else {
						++months;
						++currmonth;
					}
				} else if (currmonth == 2){
					if (curryear%4 == 0){
						days -= 29;
					} else {
						days -= 28;
					}
					++months;
					++currmonth;
				}
			}

			function checkDays(){
				if(is31()){
					if (days>31){
						return true;
					} else {
						return false;
					}
				} else if (is30()){
					if (days>30){
						return true;
					} else {
						return false;
					}
				} else if (currmonth == 2){
					if (curryear%4 == 0){
						if (days>29){
							return true;
						} else {
							return false;
						}
					} else {
						if (days>28){
							return true;
						} else {
							return false;
						}
					}
				}
			}

			function is30(){
				if (currmonth == 4 || currmonth == 6 || currmonth == 9 || currmonth == 11){
					return true;
				} else {
					return false;
				}
			}

			function is31(){
				if (currmonth == 1 || currmonth == 3 || currmonth == 5 || currmonth == 7 || currmonth == 8 || currmonth == 10 || currmonth == 12){
					return true;
				} else {
					return false;
				}
			}

			var timer = {};
			timer.months = months;
			timer.days = days;
			timer.hours = hours;
			timer.minutes = minutes;
			timer.seconds = seconds;

			return timer;

			// alert(months + ' ' + days + ' ' + hours + ' ' + minutes + ' ' + seconds);

		}
		
		function writeTimer(date, time, name){
			var timer = calculateDueDate(date, time);

			$('#month').html(timer.months);
			$('#day').html(timer.days);
			$('#hour').html(timer.hours);
			$('#minute').html(timer.minutes);
			$('#second').html(timer.seconds);

			$('#babyname').html(name);
		}
		
		// Change Due Date
		$('#editDate').click(function(){
			clearInterval(interval);
			getPartial($('#content'), 'form.html', formCode);
		});
		
		// CSS Theme switching
		$('#themeSwitcher input').change(function(){
			var css = $('link')[1];
			var url = 'css/' + $(this).val() + '.css';
			$(css).attr('href', url);
			if(hasLocalStorage == true){
				localStorage.setItem('theme', url);
			} else {
				// might overwrite...
				setCookie('theme', url, 300);
			}
		});
		
		$('#themeSwitch').hover(function(){
			$('#themeSwitcher').removeClass('off');
			$(this).addClass('off');
		}, function(){
			
		});
		
		$('#themeSwitcher').hover(function(){
			
		}, function(){
			$('#themeSwitch').removeClass('off');
			$(this).addClass('off');
		});
		
	}
			
// Get partial
	function getPartial(obj, url, fx){
		$.get(url, function(data) {
			obj.html(data);
			fx();
		});
	}

	init();

});