/**
 * @author joemoore
 */
jQuery(document).ready(function($){
  $("label.overlayed")
	.inFieldLabels({fadeDuration:150, fadeOpacity:0.4})
	.bind('click focus', function(){
		$('#'+$(this).attr('for')).focus();
	});
	
});
