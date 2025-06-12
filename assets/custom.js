/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */function LoadLibrary(liburl,callback){
    var jscript = document.createElement("script");
    jscript.type = 'text/javascript';
    jscript.src = liburl;
    //for IE type browsers
    if (jscript.readyState) { 
        jscript.onreadystatechange = function () {
            if (jscript.readyState == "loaded" || jscript.readyState == "complete") {
                jscript.onreadystatechange = null;
                callback();
            }
        };
    } else {
        jscript.onload = function () {
            callback();
        };
    }
    document.getElementsByTagName("head")[0].appendChild(jscript);
}


if (!window.jQuery) {  
    LoadLibrary('https://code.jquery.com/jquery-3.3.1.min.js',
        function(){
            console.log('jQuery loaded');
        }
    );         
}



function defer(method) {
    if (window.jQuery) {
        method();
    } else {
        setTimeout(function() { defer(method) }, 50);
    }
}

defer(function(){
$(document).ready(function(){
	$( ".Product__Slideshow .Product__SlideItem" ).clone(true).appendTo( ".slide-placeholder" );
});


	window.VIG = window.VIG || {};
	VIG.loaded = false;
	VIG.VariantChangeCallback = function(){
		var visible_ids = $('.slide-placeholder img:visible').map(function() {
			return $(this).data('image-id');
		}).get();
		$(".flickity-page-dots button").hide();
      	var visible_index = 0;
		var slidesToAdd = [];

		visible_ids.forEach(function(element) {
		slidesToAdd.push($('.slide-placeholder [data-image-id='+element+']').closest('.Product__SlideItem'));
		});
		
        var $sliders = $('.Product__Slideshow.flickity-enabled');
      
    	  $sliders.each(function() {
            
            var $slider = $(this);
            var $sliderInstance = Flickity.data(this);
            if ($sliderInstance != undefined ) {
              
                $sliderInstance.remove($('.Product__Slideshow .Product__SlideItem'));
                slidesToAdd.forEach(function(element) {
                	$sliderInstance.append(element.clone(true));
                  	visible_index = element.attr('data-image-media-position');
                  	$(".flickity-page-dots button[data-index='"+visible_index+"']").show();
                });
            } 
            else{
            console.log('slider instance undefined');
            }
        });		
		
      $(".flickity-page-dots button[data-index]:visible").first().addClass('is-selected');
        window.scrollTo(0, 0);

    }
});/*FIXED BY VIP:2020-05-01 14:49:08 UTC*/