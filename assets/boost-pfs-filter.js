
var onSale = false;
var soldOut = false;
var priceVaries = false;
var images = [];
var firstVariant = {};
// Override Settings
var boostPFSFilterConfig = {
	general: {
		limit: boostPFSThemeConfig.custom.products_per_page,
		/* Optional */
		loadProductFirst: true, 
		numberFilterTree: 2,
		filterTreeMobileStyle: 'style1'
	},
};

(function() {
	BoostPFS.inject(this);

	// Declare Templates
	var boostPFSTemplate = {
		// Grid Template
		'productGridItemHtml': '<div class="Grid__Cell 1/'+ boostPFSThemeConfig.custom.mobile_row + '--phone 1/' + boostPFSThemeConfig.custom.tablet_row + '--tablet-and-up 1/' + boostPFSThemeConfig.custom.desktop_row + '--' + buildClass() +' {{clearanceClass}}' +' {{plpHide}} '+'{{primeClass}}'+' {{tahariClass}} '+' {{thfClass}} '+' {{accessClass}} '+' {{ttahariClass}}">'+
									'<div class="ProductItem '+ buildClassHiz() +'">'+
										'<div class="ProductItem__Wrapper">'+
											'{{itemImages}}' +
											'{{itemLabels}}'+
											'{{itemInfo}}'+
										'</div>'+
										buildButtonSecond() +
									'</div>'+
								'</div>',

		// Pagination Template
		'previousActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="prev" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M9.5 1.5L1.5 9l8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path></svg></a>',
		'previousDisabledHtml': '',
		'nextActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="next" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M1.5 1.5l8 7.5-8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path> </svg></a>',
		'nextDisabledHtml': '',
		'pageItemHtml': '<a class="Pagination__NavItem Link Link--primary" href="{{itemUrl}}">{{itemTitle}}</a>',
		'pageItemSelectedHtml': '<span class="Pagination__NavItem is-active">{{itemTitle}}</span>',
		'pageItemRemainHtml': '<span class="Pagination__NavItem">{{itemTitle}}</span>',
		'paginateHtml': ' <div class="Pagination Text--subdued"><div class="Pagination__Nav">{{previous}}{{pageItems}}{{next}}</div></div>',
		// Sorting Template
		'sortingHtml': '{{sortingItems}}',
	};

	/************************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
	function prepareShopifyData(data) {
		// Displaying price base on the policy of Shopify, have to multiple by 100
		soldOut = !data.available; // Check a product is out of stock
		onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
		priceVaries = data.price_min != data.price_max; // Check a product has many prices
		// Convert images to array
		images = data.images_info;
		// Get First Variant (selected_or_first_available_variant)
		var firstVariant = data['variants'][0];
		if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
			var paramVariant = data.variants.filter(function(e) { return e.id == Utils.getParam('variant'); });
			if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
		} else {
			for (var i = 0; i < data['variants'].length; i++) {
				if (data['variants'][i].available) {
					firstVariant = data['variants'][i];
					break;
				}
			}
		}
		return data;
	}
	/************************** END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
	/************************** BUILD PRODUCT LIST **************************/
	// Build Product Grid Item
	ProductGridItem.prototype.compileTemplate = function(data, index) {
		if (!data) data = this.data;
		if (!index) index = this.index;
		// Get Template
		var itemHtml = boostPFSTemplate.productGridItemHtml;
		// Customize API data to get the Shopify data
		data = prepareShopifyData(data);
		// Add Custom class
		var soldOutClass = soldOut ? boostPFSTemplate.soldOutClass : '';
		var saleClass = onSale ? boostPFSTemplate.saleClass : '';
		// Add Label
		itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data));

		// Add Images
		itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImage(data, images));

        // Add clearanceClass
        var isclearance = data.tags.includes('finalclearance') ? 'finalclearance' : '' ; 
        itemHtml = itemHtml.replace(/{{clearanceClass}}/g, isclearance);

      // Add primeClass
        var primeday = data.tags.includes('FINALCLEARANCE') ? 'FINALCLEARANCE' : '' ; 
        itemHtml = itemHtml.replace(/{{primeClass}}/g, primeday);

      // Add plpHide
        var isplpHide = data.tags.includes('plp_hide') ? 'plp_hide' : '' ; 
        itemHtml = itemHtml.replace(/{{plpHide}}/g, isplpHide);
      
        // Add tahariClass
        var tahariproduct = data.tags.includes('taharifragrance') ? 'taharifragrance' : '' ; 
        itemHtml = itemHtml.replace(/{{tahariClass}}/g, tahariproduct);

        // Add Denim
        var thfdenim = data.tags.includes('TahariPants') ? 'TahariPants' : '' ; 
        itemHtml = itemHtml.replace(/{{thfClass}}/g, thfdenim);

      // Add TahariAccessories
        var outletacc = data.tags.includes('outletaccessories') ? 'outletaccessories' : '' ; 
        itemHtml = itemHtml.replace(/{{accessClass}}/g, outletacc); 
      

       // Add T-Tahari 
        var ttahari = data.tags.includes('THF') ? 'THF' : '' ; 
        itemHtml = itemHtml.replace(/{{ttahariClass}}/g, ttahari);

      // Add Tahari Coats
        var tcoats = data.tags.includes('taharicoats2023') ? 'taharicoats2023' : '' ; 
        itemHtml = itemHtml.replace(/{{tcoatsClass}}/g, tcoats);

      

		// Add main attribute (Always put at the end of this function)
		itemHtml = itemHtml.replace(/{{itemInfo}}/g, buildInfo(data, index));
		itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrl(data));
		return itemHtml;
	};

	/************************** END BUILD PRODUCT LIST **************************/
	/************************** BUILD PRODUCT ITEM ELEMENTS **************************/
	function buildClass() {
		return boostPFSThemeConfig.custom.filter_position == 'drawer' ? 'lap-and-up' : 'desk';
	}

	function buildClassHiz() {
		return boostPFSThemeConfig.custom.use_horizontal ? 'ProductItem--horizontal' : '';
	}

	function buildButtonSecond() {
		return boostPFSThemeConfig.custom.use_horizontal ? '<a href="{{itemUrl}}" class="ProductItem__ViewButton Button Button--secondary hidden-pocket">' + boostPFSThemeConfig.label.view_product + '</a>' : '';
	}

	function buildImage(data, images) {
		var htmlImg = '';
		if (!images) images = [];
		if (images.length == 0){
			images.push({
				src: boostPFSConfig.general.no_image_url,
				id: data.id,
				width: 480,
				height: 480
			});
		}
		if (images.length > 0) {
			htmlImg += '<a href="{{itemUrl}}" class="ProductItem__ImageWrapper ';
			var use_natural_size = false;
			var has_alternate_image = false;
			if (boostPFSThemeConfig.custom.product_image_size == 'natural' || boostPFSThemeConfig.custom.use_horizontal) {
				use_natural_size = true;
			}
			if (boostPFSThemeConfig.custom.product_show_secondary_image && images.length > 1 && !boostPFSThemeConfig.custom.use_horizontal) {
				has_alternate_image = true;
			}
			if (has_alternate_image) {
				htmlImg += 'ProductItem__ImageWrapper--withAlternateImage';
			}
			htmlImg += '">';
			
			var max_width = images[0].width;
			if (boostPFSThemeConfig.custom.use_horizontal) max_width = 125;
			var withCall = use_natural_size ? 'withFallback' : boostPFSThemeConfig.custom.product_image_size;
			htmlImg += '<div class="AspectRatio AspectRatio--' + withCall + '" style="max-width: ' + max_width + 'px;';
			var aspect_ratio = images[0].width / images[0].height;
			if (use_natural_size) {
				htmlImg += 'padding-bottom: ' + (100 / aspect_ratio) + '%;';
			}
			htmlImg += ' --aspect-ratio: ' + aspect_ratio + '">';
			
			if (has_alternate_image && images.length > 1) {
				var sizes = '200,300,400,600,800,900,1000,1200';
				var support_size = imageSize(sizes, images[1]);
				var thumbUrl = Utils.optimizeImage(images[1]['src'], '{width}x');
				htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + ' Worn by a Female Model" data-image-id="' + images[1].id + '">';
			}
			
			var sizes_main = '200,400,600,700,800,900,1000,1200';
			var support_size = imageSize(sizes_main, images[0]);
			var thumbUrl_main = images.length > 0 ? Utils.optimizeImage(images[0]['src'], '{width}x') : boostPFSConfig.general.no_image_url;
			htmlImg += '<img class="ProductItem__Image Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl_main + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + ' Worn by a Female Model" data-image-id="' + images[0].id + '">';
			htmlImg += '<span class="Image__Loader"></span>';
			htmlImg += '<noscript>';
			htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate" src="' + Utils.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + ' Worn by a Female Model">';
			htmlImg += '<img class="ProductItem__Image" src="' + Utils.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + ' Worn by a Female Model">';
			htmlImg += '</noscript>';
			htmlImg += '</div>';
			htmlImg += '</a>';
		}
		return htmlImg;
	}

	function imageSize(sizes, image) {
		if (image) {
			var desired_sizes = sizes.split(',');
			var supported_sizes = '';
			for (var k = 0; k < desired_sizes.length; k++) {
				var size = desired_sizes[k];
				var size_as_int = size * 1;
				if (image.width < size_as_int) { break; }
				supported_sizes = supported_sizes + size + ',';
			}
			
			if (supported_sizes == '') supported_sizes = image.width;
			
			if(!jQ.isNumeric(supported_sizes)) {
				supported_sizes = supported_sizes.split(',').join(',');
				supported_sizes = supported_sizes.substring(0,supported_sizes.lastIndexOf(','));
			}
			return supported_sizes;
		} else {
			return '';
		}
	}

	function buildPrice(data) {
		var html = '';
		var show_price_on_hover = boostPFSThemeConfig.custom.product_show_price_on_hover;
		var classPriceHover = show_price_on_hover ? 'ProductItem__PriceList--showOnHover' : '';
		html += '<div class="ProductItem__PriceList ' + classPriceHover + ' Heading">';
		if (onSale) {
			html += '<span class="ProductItem__Price Price Price--highlight Text--subdued" aria-label="Discount Price" tabindex="0" data-money-convertible>' + Utils.formatMoney(data.price_min) + '</span> ';
			html += '<span class="ProductItem__Price Price Price--compareAt Text--subdued"  aria-label="Full Price" data-money-convertible>' + Utils.formatMoney(data.compare_at_price_min) + '</span>';
		  var discount = ((data.compare_at_price_min - data.price_min) / (data.compare_at_price_min)) * 100;
          //var rounddis = Math.trunc(discount);
           var rounddis = Math.round(discount);
          var save = 'Save ';
          var perSymbol = '%';
          if( discount > 5 ){
                html += '<span class="discount" tabindex="0">'+ save + rounddis + perSymbol +'</span> '; 
            }
        } else {
			if (priceVaries) {
				html += '<span class="ProductItem__Price Price Text--subdued" tabindex="0">' + boostPFSThemeConfig.label.from.replace(/{{min_price}}/g, Utils.formatMoney(data.price_min)) + '</span>';
			} else {
				html += '<span class="ProductItem__Price Price Text--subdued" tabindex="0" aria-label="Full Price" data-money-convertible>' + Utils.formatMoney(data.price_min) + '</span>';
			}
		}
		html += '</div>';
		return html;
	}

	function buildLabels(data) {
    var product_labels = '';
    var labelsSet = new Set();

    // Check if labels should be displayed
    if (boostPFSThemeConfig.custom.show_labels) {
        var tags = data.tags;
        var conditionDifferenceMet = false;
        var conditionCollectionMet = false;
        var conditionTagMet = false;

        // Function to add label
        function addLabel(label, className) {
            if (!labelsSet.has(label)) {
                product_labels += `<span class="${className} Heading Text--subdued">${label}</span>`;
                labelsSet.add(label);
            }
        }

        // Add label based on tags
        for (var tag of tags) {
            if (tag.indexOf('__label') !== -1) {
                addLabel(tag.split('__label:')[1], 'ProductItem__Label');
                break; // Only one __label tag is expected
            }
        }

        // Calculate the date difference
        function dateDiffInDays(a, b) {
            const _MS_PER_DAY = 1000 * 60 * 60 * 24;
            const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
            return Math.floor((utc2 - utc1) / _MS_PER_DAY);
        }

        var publishedDate = new Date(data.published_at.split('T')[0]);
        var nowDate = new Date();
        var difference = dateDiffInDays(publishedDate, nowDate);

        // Check if the date difference condition is met
        if (difference < 21) {
            conditionDifferenceMet = true;
        }

        // Check if the collection handle condition is met
        /*for (var collection of data.collections) {
            if (collection.handle === 'new-arrivals') {
                conditionCollectionMet = true;
                break; // Only need to meet one condition
            }
        }*/

        // Check if the ET50 tag condition is met
        /*for (var tag of tags) {
            if (tag.indexOf('ET50') !== -1) {
                conditionTagMet = true;
                break; // Only one ET50 tag is expected
            }
        }*/

        // Add 'New' label if conditions are met
        if (conditionDifferenceMet && !onSale) {
            addLabel('New', 'ProductItem__Label--onSale');
        }

          var compare_at_price_min = data.compare_at_price_min;
          var price_min = data.price_min
          var discount = ((compare_at_price_min - price_min) / compare_at_price_min) * 100;
          var rounddis = Math.round(discount);
          var save = 'Save ';
          var perSymbol = '%';


        // Add sale or sold-out label
        if (!soldOut) {
            if (onSale) {
              //conditionSoldMet= true;
              if (conditionCollectionMet || conditionDifferenceMet ) {
                addLabel( save + rounddis + perSymbol, 'ProductItem__Label--onSale');
                } else {
                addLabel( save + rounddis + perSymbol, 'ProductItem__Label--onSale');
                }
            }
        } else {
           //conditionSaleMet= true;
            addLabel(boostPFSThemeConfig.label.sold_out, 'ProductItem__Label--soldOut');
        }

      

        // Clear all labels and add only the anniversary label if all conditions are met
       /* if (conditionTagMet) {
            product_labels = ''; // Clear previous labels
            addLabel('<img src="https://cdn.shopify.com/s/files/1/0350/8997/3385/files/anniversary_logo.png?v=1725473353" alt="50th Anniversary" class="ProductItem__Label--onSale Heading Text--subdued specials anniversary">', '');
        }*/

        // Build final HTML
        var html = '';
        if (product_labels) {
            html += '<div class="ProductItem__LabelList">';
            html += product_labels;
            html += '</div>';
        }
        return html;
    }
    return '';
}


	function buildInfo(data, indx) {     
		var html = '';
      var ExtraOff = data.tags;
      var vendor = data.vendor;
      var vss = ExtraOff.indexOf("SS25") > -1;
      /*var ff = ExtraOff.indexOf("FS25") > -1;*/
      /*var ff = ExtraOff.indexOf("samplesale") > -1;
      var pp = ExtraOff.indexOf("SAMPLESALE") > -1;
      var mm = ExtraOff.indexOf("MDS25") > -1;*/
      /*var ol = ExtraOff.indexOf("OL40") > -1;*/
      /*var SOS = ExtraOff.indexOf("SOS25") > -1;*/
      /*var DD = ExtraOff.indexOf("dressevent40") > -1;*/
      /*var JJ = ExtraOff.indexOf("J25") > -1;*/
      /*var MMF = ExtraOff.indexOf("MMS") > -1;*/
      /*var DETT = ExtraOff.indexOf("TDE24") > -1;*/
      /*var summer = ExtraOff.indexOf("JULY23") > -1;*/
       /*var summersale = ExtraOff.indexOf("ss23") > -1;
      var summersale1 = ExtraOff.indexOf("SS23") > -1;*/
      /*var outdressevent = ExtraOff.indexOf("OutletDressevent23") > -1; */
        /*var fandf = ExtraOff.indexOf("FF23") > -1; 
     var coats = ExtraOff.indexOf("50offcoats") > -1;
      var Fall = ExtraOff.indexOf("FALLEVENT22") > -1;
      var semicoll = ExtraOff.indexOf("semicoll") > -1;
      var semiout = ExtraOff.indexOf("semiout") > -1;
      var outletspecial = ExtraOff.indexOf("suitingspecials") > -1;*/
      
      
      
     
		if (boostPFSThemeConfig.custom.show_product_info) {
			var infoClass = (!boostPFSThemeConfig.custom.use_horizontal) ? 'ProductItem__Info--' + boostPFSThemeConfig.custom.product_info_alignment : '';
			html += '<div class="ProductItem__Info ' + infoClass + ' ">';
			if (boostPFSThemeConfig.custom.show_vendor) {
				html += '<p class="ProductItem__Vendor Heading">' + data.vendor + '</p>'
			}
         /*if(  ff == true ) { 
            html += '<p class="dressevent">' + "Limited Offer " + '</p>'
            }
          if(  pp == true ) { 
            html += '<p class="dressevent">' + "Limited Offer " + '</p>'
            }*/
          if(  vss == true ) { 
            html += '<p class="dressevent sample ">' + "Extra 30% OFF Code: " + '<b>' + "SUMMER30" + '</b>' + '</p>'
            }
          if(  vss == true ) { 
            html += '<p class="dressevent-outlet">' + "Extra 30% OFF Code: " + '<b>' + "SUMMER30" + '</b>' + '</p>'
            }
          /*if(  cm24 == true ) { 
            html += '<p class="dressevent">' + "Cyber Sale Specials " + '</p>'
            }
          if(  cm24 == true || cmts == true ) { 
            html += '<p class="dressevent-outlet">' + "Cyber Sale Specials " + '</p>'
            }*/
          /*if(  DD == true ) { 
            html += '<p class="dressevent">' + '<b>' + "Extra 40% OFF Code: " + '</b>' + "EXTRA40" + '</p>'
            }*/
          /*if(  JJ == true ) { 
            html += '<p class="dressevent reactivation">' + '<b>' + "Extra 30% OFF Code: " + '</b>' + "30OFF" + '</p>'
            }
           if(  JJ == true ) { 
            html += '<p class="dressevent-outlet">' + '<b>' + "Extra 25% OFF Code: " + '</b>' + "25OFF" + '</p>'
            }
          if(  JJ == true ) { 
            html += '<p class="dressevent-outlet reactivation">' + '<b>' + "Extra 30% OFF Code: " + '</b>' + "30OFF" + '</p>'
            }*/
         /*if(  SS == true ) { 
            html += '<p class="dressevent">' + '<b>' + "Extra 25% OFF Code: " + '</b>' + "SUMMER25" + '</p>'
            }

             if(  SS == true ) { 
            html += '<p class="dressevent-outlet">' + '<b>' + "Extra 25% OFF Code: " + '</b>' + "SUMMER25" + '</p>'
            }
          if(  MMF == true ) { 
            html += '<p class="dressevent-outlet">' + '<b>' + "Weekend Specials " + '</p>'
            }*/

           /*if(  SP == true ) { 
            html += '<p class="dressevent ffthirty">' + '<b>' + "Extra 30% OFF | " + '</b>' + "Code: FRIENDS30" + '</p>'
            }
          
          
          if(  ff == true ) { 
            html += '<p class="dressevent-outlet ffthirty">' + '<b>' + "Extra 30% OFF | " + '</b>' + "Code: FRIENDS30" + '</p>'
            }*/
         
          /*if( BFS == true && BF == false || CSS == true && BF ==false ) { 
            html += '<p class="dressevent special">' + '<b>' + "Cyber Specials" + '</b>' + '</p>'
            }
          
           if( BFS == true && BF == false || CSS == true && BF ==false  ) { 
            html += '<p class="dressevent-outlet">' + '<b>' + "Cyber Specials" + '</b>' + '</p>'
            }*/
          /*if(  Labor == true ) { 
            html += '<p class="dressevent">' + '<b>' + "Extra 20% OFF code: " + '</b>' + "LDW20" + '</p>'
            }
          
           if( Labor == true  ) { 
            html += '<p class="dressevent-outlet">' + "Labor Day Sale " + '<br>' + "Extra 20% OFF code: " + '<b>' + "LDW20" + '</b>'  + '</p>'
            }*/
          /*if( wknd == true) { 
            html += '<p class="dressevent-outlet">' + "Weekend Special"  + '</p>'
            }*/
          
/*
          if( fandf == true ) { 
            html += '<p class="dressevent-outlet">' + "Friends and Family " + '<br>' + "Extra 30% OFF code: " + '<b>' + "FRIENDS30" + '</b>' + '</p>'
            }*/
           /*if( samplesale == true) { 
            html += '<p class="dressevent-outlet sample">' + "Sample Sale " + '<br>' + "Up to 80% Off  " + '</p>'
            } */

         /*
          if( lastchance == true || outletsweater == true  ) { 
            html += '<p class="dressevent-outlet">' + "Last Chance Sale " + '<br>' + "Up to 80% Off  " + '</p>'
            }
            */

           /*if( FandF == true ) { 
            html += '<p class="dressevent-outlet">' + "Friends and Family " + '<br>' + "Extra 30% OFF code: " + '<b>' + "FRIENDS30" + '</b>' + '</p>'
            }

          if( coats == true  ) { 
            html += '<p class="dressevent-outlet coats">' + "Coat Specials " + '<br>' + "Starting at $99 " + '</p>'
            }*/

          /*if( holidaysale == true && sweatershop == false && coatspecials == false && finalsale == false ) { 
            html += '<p class="dressevent">' + "Holiday Sale " + '<br>' + "30 - 50% OFF " + '</p>'
            }
          if( sweatershop == true && holidaysale == true  ) { 
            html += '<p class="dressevent special">' + "Sweater Specials " + '<br>' + "40% OFF " + '</p>'
            }
          if(  coatspecials == true && holidaysale == true || coatspecials == true && finalsale == true ) { 
            html += '<p class="dressevent coats">' + "Coat Specials " + '<br>' + "Starting At $99 " + '</p>'
            }
          if( finalsale == true && holidaysale == false || finalsale == true && coatspecials == false ) { 
            html += '<p class="dressevent">' + "Final Sale " + '<br>' + "60% OFF " + '</p>'
            }

          if( holidaysaleoutlet == true && sweatershop == false && coatspecials == false && finalsale == false ) { 
            html += '<p class="dressevent-outlet">' + "Holiday Sale " + '<br>' + "30 - 70% OFF " + '</p>'
            }
          if( sweatershop == true && holidaysaleoutlet == true  ) { 
            html += '<p class="dressevent-outlet special">' + "Sweater Specials " + '<br>' + "40% OFF " + '</p>'
            }
          if(  coatspecials == true && holidaysaleoutlet == true || coatspecials == true && finalsale == true ) { 
            html += '<p class="dressevent-outlet coats">' + "Coat Specials " + '<br>' + "Starting At $99 " + '</p>'
            }
          if( finalsale == true && holidaysaleoutlet == false && coatspecials == false || finalsale == true && coatspecials == false ) { 
            html += '<p class="dressevent-outlet">' + "Final Sale " + '<br>' + "60% OFF " + '</p>'
            }*/
          
          
          
            /*if( blackfriday == true) { 
            html += '<p class="dressevent">' + "Cyber Sale " + '<br>' + "Extra 30% OFF code: " + '<b>' + "CYBER30" + '</b>' + '</p>'
            }
          if( cyberspecials == true && specials == true || cyberspecials == true && specials == false ) { 
            html += '<p class="dressevent cyberspecials">' + "Cyber Specials" + '<br>' + "starting at $39" + '</p>'
            }
        
         if( blackfriday == true || outletblackfriday == true) { 
            html += '<p class="dressevent-outlet">' + "Cyber Sale " + '<br>' + "Extra 30% OFF code: " + '<b>' + "CYBER30" + '</b>' + '</p>'
            }
          if( specials == true && cyberspecials == false) { 
            html += '<p class="dressevent special">' + "Black Friday Specials" + '<br>' + "60% OFF" + '</p>'
            }

          if( taharicoats == true) { 
            html += '<p class="dressevent-outlet coats">' + "Tahari Coats" + '<br>' + "Extra 30% OFF code: " + '<b>' + "CYBERCOATS" + '</b>' + '</p>'
            }

         
         if( specials == true && blackfriday == false && outletblackfriday == false && taharicoats == false && cyberspecials == false) { 
            html += '<p class="dressevent-outlet special">' + "Black Friday Specials" + '<br>' + "60% OFF" + '</p>'
            }
         if( cyberspecials == true && specials == true && taharicoats == false || cyberspecialsoutlet == true && taharicoats == false) { 
            html += '<p class="dressevent-outlet cyberspecials">' + "Cyber Specials" + '<br>' + "starting at $39" + '</p>'
            }*/
          
          /*if( samplesale == true) { 
            html += '<p class="dressevent-outlet">' + "Sample Sale " + '<br>' + "60% - 80% OFF  " +  '</p>'
            }*/
          
          /*if( Fall == true && coats == true ) { 
            html += '<p class="dressevent">' + "Coat Event" + '<br>' + "Extra 50% OFF code:" + '<b>' + "COAT50" + '</b>' +  '</p>'
            }
          else if( Fall == true) { 
            html += '<p class="dressevent" style="background:#9A2806">' + "Fall Event" + '<br>' + "Up To 50% OFF " + '</p>'
            }
         if( Fall == true && coats == true ) {
            html += '<p class="dressevent-outlet">' + "Coat Event" + '<br>' + "Extra 50% OFF code:" + '<b>' + "COAT50" + '</b>' +  '</p>'
         }
         else if( Fall == true) { 
            html += '<p class="dressevent-outlet" style="background:#9A2806">' + "Fall Event" + '<br>' + "Up To 50% OFF " +  '</p>'
            }*/
          /*if( semicoll == true) { 
            html += '<p class="dressevent">' + "Semi Annual Sale - " +  "UP TO 50% OFF" + '</p>'
            }
          
          if( semiout == true) { 
           html += '<p class="dressevent-outlet">' + "Semi Annual Sale - " + "UP TO 70% OFF" + '</p>'
            }
          if( outletspecial == true) { 
           html += '<p class="dressevent-outlet specials">' + "Outlet Specials" + '</p>'
            }*/
           /*if( laborspecial == true) { 
           html += '<p class="dressevent-outlet specialss">' + "Labor Day Specials" + '</p>'
            }*/
          
        

			html += '<h2 class="ProductItem__Title Heading">';
			html += '<a href="{{itemUrl}}" aria-label="Click here to view '+ data.title + ' detail page">' + data.title + '</a>';
			html += '</h2>';        
			html += buildPrice(data);
			if (boostPFSThemeConfig.custom.show_color_swatch) {
				html += buildSwatch(data, indx);	
			}
			html += '</div>';
		}

		return html;
	}

	function buildSwatch(data, indx) {
		var itemSwatchHtml = '';
		if (boostPFSThemeConfig.custom.show_color_swatch) {
		var color_name = boostPFSThemeConfig.custom.section_id + '-' + data.id + '-' + indx;
		data.options_with_values.forEach(function (option, index) {
			var option_name = option.name.toLowerCase();
			if (option_name.indexOf('color') != -1 || option_name.indexOf('colour') != -1 || option_name.indexOf('couleur') != -1) {
			var values = '';
			itemSwatchHtml += '<div class="ProductItem__ColorSwatchList" aria-hidden="true">';
			var i = 0;
			data.variants.forEach(function (variant) {
				var temp = variant.merged_options.filter(function (obj) {
				obj = obj.toLowerCase();
				if (obj.indexOf('color') != -1 || obj.indexOf('colour') != -1)
					return obj;
				});
				temp = temp[0].split(':');

				var value = temp[1].toLowerCase();
				if (values.indexOf(value) == -1) {
				values = values + ',' + value;
				values = values.split(',');
				var size = '200,400,600,700,800,900,1000,1200';
				var supported_sizes = imageSize(size, variant.image);
				var color_image = Utils.optimizeImage(variant.image);
				var name_color = Utils.slugify(value) + '.png';
				var checked = (i == 0) ? 'checked=checked' : '';
				var imageInfo = null;
				var image_aspect_ratio = 1;
				imageInfo = data.images_info.find(function (imageOb) {
					if (imageOb.src == variant.image){
						image_aspect_ratio = imageOb.width / imageOb.height;
					return imageOb;
					} 
				});
				if (!imageInfo){
					if (data.images_info.length > 0){
						imageInfo = data.images_info[0];
					} else {
						imageInfo = {
						src: boostPFSConfig.general.no_image_url,
							id: variant.id,
							width: 480,
							height: 480
						}
					}
					
				}
				var dataImg = (imageInfo != null) ? '" data-image-url="' + imageInfo.src + '" data-image-widths="[' + supported_sizes + ']" data-image-aspect-ratio="1" data-image-id="' + imageInfo.id + '"' : '';
				var color_input_id = color_name + "-" + values.length;
				var variant_price = variant.price ? variant.price : 0;
				var variant_compare_at_price = variant.compare_at_price ? variant.compare_at_price : 0;
                var newurlcolor = Utils.getFilePath(Utils.slugify(value), Globals.swatchExtension, Settings.getSettingValue('general.swatchImageVersion'));
				var url_color = Utils.getFilePath(Utils.slugify(value), Globals.swatchExtension, Settings.getSettingValue('general.swatchImageVersion'));
				itemSwatchHtml += '<div class="ProductItem__ColorSwatchItem">';
				itemSwatchHtml += '<input class="ColorSwatch__Radio" type="radio" ' + checked + ' name="' + color_name + '" id="' + color_input_id + '" value="' + value + '" data-image-aspect-ratio="' + image_aspect_ratio + '" data-variant-price="' + variant_price + '" data-variant-compare-at-price="' + variant_compare_at_price + '" data-variant-url="' + Utils.buildProductItemUrl(data) + '?variant=' + variant.id + '#Image' +  imageInfo.id + '"' + dataImg + '  aria-hidden="true">';
				itemSwatchHtml += '<label class="ColorSwatch ColorSwatch--small" for="' + color_input_id + '" style="background-color: ' + value.replace(' ', '').toLowerCase() + '; background-image: url(' + newurlcolor + ')" title="' + value + '" data-tooltip="' + Utils.capitalize(value, true, true) + '">color-swatch</label>';
				itemSwatchHtml += '</div>';
				i++;
				}
			});
			itemSwatchHtml += '</div>';
			}
		});
		}
		return itemSwatchHtml;
	}
	/************************** END BUILD PRODUCT ITEM ELEMENTS **************************/
	/************************** BUILD TOOLBAR **************************/
	// Build Pagination
	ProductPaginationDefault.prototype.compileTemplate = function(totalProduct) {
		if (!totalProduct) totalProduct = this.totalProduct
		// Get page info
		var currentPage = parseInt(Globals.queryParams.page);
		var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

		if (Settings.getSettingValue('general.paginationType') == 'default' && totalPage > 1) {
			var paginationHtml = boostPFSTemplate.paginateHtml;
			// Build Previous
			var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : boostPFSTemplate.previousDisabledHtml;
			previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
			paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
			// Build Next
			var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : boostPFSTemplate.nextDisabledHtml;
			nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
			paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
			// Create page items array
			var beforeCurrentPageArr = [];
			for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
				beforeCurrentPageArr.unshift(iBefore);
			}
			if (currentPage - 4 > 0) {
				beforeCurrentPageArr.unshift('...');
			}
			if (currentPage - 4 >= 0) {
				beforeCurrentPageArr.unshift(1);
			}
			beforeCurrentPageArr.push(currentPage);
			var afterCurrentPageArr = [];
			for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
				afterCurrentPageArr.push(iAfter);
			}
			if (currentPage + 3 < totalPage) {
				afterCurrentPageArr.push('...');
			}
			if (currentPage + 3 <= totalPage) {
				afterCurrentPageArr.push(totalPage);
			}
			// Build page items
			var pageItemsHtml = '';
			var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
			for (var iPage = 0; iPage < pageArr.length; iPage++) {
				if (pageArr[iPage] == '...') {
				pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
				} else {
				pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
				}
				pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
				pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
			}
			paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
			return paginationHtml;
		}

		return '';
	};

	// Build Sorting
	ProductSorting.prototype.compileTemplate = function() {
		var html = '';
		if (boostPFSThemeConfig.custom.show_sorting && boostPFSTemplate.hasOwnProperty('sortingHtml')) {
			var sortingArr = Utils.getSortingList();
			if (sortingArr) {
				// Build content
				var sortingItemsHtml = '';
				for (var k in sortingArr) {
					var classActive = (Globals.queryParams.sort == k) ? 'is-selected' : '';
					sortingItemsHtml += '<button class="Popover__Value ' + classActive + ' Heading Link Link--primary u-h6" aria-label="Show-sort-by '+ k +'" data-value="' + k + '">' + sortingArr[k] + '</button>';
				}
				html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
			}
		}
		return html;
	};

	// Build Sorting event
	ProductSorting.prototype.bindEvents = function() {
		var topSortingSelector = jQ(Selector.topSorting);
		topSortingSelector.find('.Popover__Value').click(function(e) {
			FilterApi.setParam('sort', jQ(this).data('value'));
            FilterApi.setParam('page', 1);
			FilterApi.applyFilter('sort');
			jQ('.CollectionToolbar__Item--sort').trigger('click');
		});
	}
	/************************** END BUILD TOOLBAR **************************/

	// Add additional feature for product list, used commonly in customizing product list
	ProductList.prototype.afterRender = function(data, eventType) {
		if (!data) data = this.data;
		if (!eventType) eventType = this.eventType;
		/**
		 *  Call theme function 
		 *  1. Add var bcPrestigeSections; var bcPrestigeSectionContainer; to assets/theme.min.js
		 *  2. In assets/theme.min.js, find var YYY=new XXX.SectionContainer; For example: var e=new o.SectionContainer;
		 *  3. Replace var e=new o.SectionContainer; by var e=new o.SectionContainer; var YYY = new XXX.SectionContainer;  bcPrestigeSections = YYY; bcPrestigeSectionContainer = XXX;
		
		if(typeof bcPrestigeSectionContainer != 'undefined' && typeof bcPrestigeSections != 'undefined'){
		bcPrestigeSections.register("collection", bcPrestigeSectionContainer.CollectionSection);
		bcPrestigeSections.register("search", bcPrestigeSectionContainer.SearchSection);
		}  
		*/

		// Fix image not load on Instagram browser - initialize swatch image
		jQ(".ProductItem__Info .ProductItem__ColorSwatchList .ProductItem__ColorSwatchItem label.ColorSwatch").click(function() {
			jQ(this).parent().parent().find('label.ColorSwatch').removeClass('active');
			jQ(this).addClass('active');
			var parent = jQ(this).parent();
			var productImage = jQ(this).parent().parent().parent().parent().find('a.ProductItem__ImageWrapper');
			var variantInfo = parent.find('input.ColorSwatch__Radio');
			productImage.find('.AspectRatio .bc-sf-product-swatch-img').remove();
			productImage.find('.AspectRatio').prepend('<img class="bc-sf-product-swatch-img" src="' + variantInfo.data('image-url') + '" />');
			productImage.find('img.ProductItem__Image').hide();
			productImage.attr('href', variantInfo.data('variant-url'));
			var variantPrice = '';
			if (variantInfo.data('variant-compare-at-price') > variantInfo.data('variant-price')){
				variantPrice += '<span class="ProductItem__Price Price Price--highlight Text--subdued" data-money-convertible="">' + Utils.formatMoney(variantInfo.data('variant-price')) + '</span>'
				variantPrice += '<span class="ProductItem__Price Price Price--compareAt Text--subdued" aria-hidden="true" data-money-convertible="">' + Utils.formatMoney(variantInfo.data('variant-compare-at-price')) + '</span>';
			} else {
				variantPrice += '<span class="ProductItem__Price Price Text--subdued" data-money-convertible>' + Utils.formatMoney(variantInfo.data('variant-price')) + '</span>';
			}
			jQ(this).closest('.ProductItem__Wrapper').find('.ProductItem__PriceList').html(variantPrice);
		})
	};

	// Build additional elements
	FilterResult.prototype.afterRender = function(data, eventType) {
		if (!data) data = this.data;
		if (!eventType) eventType = this.eventType;
	};  
  
	// Build Default layout
	Filter.prototype.errorFilterCallback = function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};
})();

/*window.onload = function() {
    const collections = [
        { handle: "tops", imageUrl: "https://cdn.shopify.com/s/files/1/0350/8997/3385/files/F_F_2000x3000_1.jpg?v=1709910054", insertIndex: 5 },
        { handle: "dresses", imageUrl: "https://cdn.shopify.com/s/files/1/0350/8997/3385/files/F_F_2000x3000_3.jpg?v=1709910054", insertIndex: 7 },
       { handle: "suiting", imageUrl: "https://cdn.shopify.com/s/files/1/0350/8997/3385/files/F_F_2000x3000_2.jpg?v=1709910054", insertIndex: 5 },
       { handle: "the-color-shop", imageUrl: "https://cdn.shopify.com/s/files/1/0350/8997/3385/files/F_F_2000x3000_2.jpg?v=1709910054", insertIndex: 7 },
      { handle: "print-perfection", imageUrl: "https://cdn.shopify.com/s/files/1/0350/8997/3385/files/F_F_2000x3000_1.jpg?v=1709910054", insertIndex: 5 },
    ];

    collections.forEach(function(collection) {
        if (window.location.href.includes(collection.handle)) {
            const gridCells = document.querySelectorAll('.Grid__Cell');
            if (gridCells.length > 1) {
                const banner = document.createElement('div');
                banner.classList.add('Grid__Cell', '1/2--phone', '1/3--tablet-and-up', '1/4--desk');
                banner.innerHTML = `<div class="banner"><a href="/collections/friends-family"><img src="${collection.imageUrl}"/></a></div>`;
                gridCells[0].parentNode.insertBefore(banner, gridCells[collection.insertIndex]);
            }
        }
    });
};*/

/* Begin patch boost-010 run 2 */
Filter.prototype.beforeInit=function(){var t=this.isBadUrl();t&&(this.isInit=!0,window.location.href=window.location.pathname)},Filter.prototype.isBadUrl=function(){try{var t=decodeURIComponent(window.location.search).split("&"),e=!1;if(t.length>0)for(var n=0;n<t.length;n++){var i=t[n],r=(i.match(/</g)||[]).length,a=(i.match(/>/g)||[]).length,o=(i.match(/alert\(/g)||[]).length,h=(i.match(/execCommand/g)||[]).length;if(r>0&&a>0||r>1||a>1||o||h){e=!0;break}}return e}catch(l){return!0}};
/* End patch boost-010 run 2 */
