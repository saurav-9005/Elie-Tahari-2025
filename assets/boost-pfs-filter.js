
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
		filterTreeMobileStyle: 'style1',
		paginationType: "load-more",
	},
};

// Initialize boostPFSFilterProducts
window.boostPFSFilterProducts = [];
window.boostPFSFilterProductsPromise = null;

// Function to update boostPFSFilterProducts
function updateBoostPFSFilterProducts(products) {
  if (Array.isArray(products)) {
    window.boostPFSFilterProducts = products;
  }
}
// Function to fetch products data once and cache it
function fetchAllProductsOnce() {
  if (window.boostPFSFilterProductsPromise) {
    return window.boostPFSFilterProductsPromise;
  }

  // Get current collection handle from URL
  var currentPath = window.location.pathname;
  var collectionHandle = null;

  // Extract collection handle from URL patterns like /collections/collection-name
  var collectionMatch = currentPath.match(/\/collections\/([^\/\?]+)/);
  if (collectionMatch) {
    collectionHandle = collectionMatch[1];
  }

  // Fallback: try to get from BoostPFS config if available
  if (
    !collectionHandle &&
    typeof Globals !== "undefined" &&
    Globals.collection &&
    Globals.collection.handle
  ) {
    collectionHandle = Globals.collection.handle;
  }

  if (!collectionHandle) {
    console.log(
      "Could not determine collection handle, using empty products array"
    );
    window.boostPFSFilterProductsPromise = Promise.resolve([]);
    return window.boostPFSFilterProductsPromise;
  }

  var fetchUrl =
    "/collections/" + collectionHandle + "/products.json?limit=250";
  console.log("Fetching all products from:", fetchUrl);

  window.boostPFSFilterProductsPromise = fetch(fetchUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (jsonData) {
      console.log("Successfully fetched", jsonData.products.length, "products");
      // Convert to boost format and update global array
      var convertedProducts = jsonData.products.map(function (product) {
        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          variants: product.variants,
          images_info: product.images,
          tags: product.tags || [],
          options_with_values: product.options || [],
          skus: product.variants
            ? product.variants
                .map(function (v) {
                  return v.sku;
                })
                .filter(Boolean)
            : [],
        };
      });

      updateBoostPFSFilterProducts(convertedProducts);
      return convertedProducts;
    })
    .catch(function (error) {
      console.error("Error fetching all products:", error);
      return [];
    });

  return window.boostPFSFilterProductsPromise;
}

// Inject CSS for swatch loading states
function injectSwatchStyles() {
  if (!document.getElementById("boost-swatch-styles")) {
    var style = document.createElement("style");
    style.id = "boost-swatch-styles";
    style.textContent = `
      .color-swatch-loading {
        font-size: 12px;
        color: #666;
        padding: 8px 0;
        text-align: center;
        font-style: italic;
      }
      .color-swatch-loading:after {
        content: '';
        display: inline-block;
        margin-left: 4px;
        width: 12px;
        height: 12px;
        border: 2px solid #ccc;
        border-top: 2px solid #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

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
			
			 // Add metafields display if they exist
			if (data.metafields && data.metafields.length > 0) {
				html += '<div class="ProductItem__Metafields">';
				data.metafields.forEach(function (metafield) {
				if (metafield.value) {
					html += '<p class="ProductItem__Metafield">';
					html +=
					'<span class="ProductItem__MetafieldKey">' +
					metafield.key +
					":</span> ";
					html +=
					'<span class="ProductItem__MetafieldValue">' +
					metafield.value +
					"</span>";
					html += "</p>";
				}
				});
				html += "</div>";
			}
          
        

			 html +='<div class="ProductItem__TitlePriceRow">';
			html += '<h2 class="ProductItem__Title Heading">';
			html += '<a href="{{itemUrl}}" aria-label="Click here to view '+ data.title + ' detail page">' + data.title + '</a>';
			html += '</h2>';
			html += '<div class="ProductItem__PriceList Heading" style="margin-left: 12px; white-space: nowrap;">';        
			html += buildPrice(data);			
			html += "</div>";
			html += "</div>";
			if (boostPFSThemeConfig.custom.show_color_swatch) {
				html +=
					'<div class="ProductItem__ColorSwatchRow"><div>' +
					buildSwatch(data, indx, null) +
					"</div></div>";	
				}
			html += '</div>';
      		html += "</div>";
		}

		return html;
	}

	function getRelatedProductHandles(tags) {
    var handles = [];
    tags.forEach(function (tag) {
      if (tag.indexOf("_color:") === 0) {
        var handle = tag.split("_color:")[1];
        if (handle) {
          handles.push(handle);
        }
      }
    });
    return handles;
  }

	function buildSwatch(data, indx, allProducts) {
		var itemSwatchHtml = '';
		if (boostPFSThemeConfig.custom.show_color_swatch) {
		var color_name = boostPFSThemeConfig.custom.section_id + '-' + data.id + '-' + indx;
		var swatchListId = "swatch-list-" + data.id + "-" + indx;
		itemSwatchHtml +=
        '<div class="ProductItem__ColorSwatchList" id="' + swatchListId + '">';
		var allColors = [];
      	var variantsByColor = {};
		var baseSku = null;
      if (data.skus && data.skus.length > 0 && data.skus[0]) {
        var firstSku = data.skus[0];
        var skuParts = firstSku.split("-");
        if (skuParts.length > 0) {
          baseSku = skuParts[0];
          console.log("Base SKU for current product:", baseSku);
        }
      }
	  itemSwatchHtml +=
        '<div class="color-swatch-loading">Loading colors...</div>';
      itemSwatchHtml += "</div>";

	  // Use the centralized fetch function
      fetchAllProductsOnce().then(function (fetchedProducts) {
        console.log(
          "products",
          fetchedProducts ? fetchedProducts.length : 0,
          data.title,
          data.skus[0].split("-")[0]
        );

		if (fetchedProducts && fetchedProducts.length > 0) {
          var swatchHtml = buildSwatchFromProducts(
            data,
            indx,
            baseSku,
            fetchedProducts
          );

		    var swatchContainer = document.getElementById(swatchListId);
          if (swatchContainer) {
            swatchContainer.innerHTML = swatchHtml;
            // Re-bind click events for the new swatches
            bindSwatchClickEvents(swatchContainer);
          }
        } else {
          // Clear loading message if no products found
          var swatchContainer = document.getElementById(swatchListId);
          if (swatchContainer) {
            swatchContainer.innerHTML = "";
          }
		}
		});
		 	return itemSwatchHtml;
		}
			return itemSwatchHtml;
		}

		// Unified function to build swatch HTML from products data
  function buildSwatchFromProducts(data, indx, baseSku, productsToSearch) {
    var allColors = [];
    var variantsByColor = {};

    // First, check for manual color grouping tags
    var manualColorGroup = null;
    console.log("tags", data.tags);
    if (data.tags && data.tags.length > 0) {
      for (var i = 0; i < data.tags.length; i++) {
        var tag = data.tags[i];
        if (tag.indexOf("_color_group:") === 0) {
          manualColorGroup = tag.split("_color_group:")[1];
          break;
        }
      }
    }

    var matchingProducts = [];

    if (manualColorGroup) {
      // Manual grouping: find all products with the same _color_group tag
      console.log("Using manual color grouping:", manualColorGroup);
      productsToSearch.forEach(function (product) {
        if (product.tags && product.tags.length > 0) {
          for (var i = 0; i < product.tags.length; i++) {
            var tag = product.tags[i];
            if (tag === "_color_group:" + manualColorGroup) {
              matchingProducts.push(product);
              break;
            }
          }
        }
      });
    } else {
      // Automatic grouping: find all products with matching base SKU
      console.log("Using automatic SKU-based grouping with base SKU:", baseSku);
      productsToSearch.forEach(function (product) {
        if (product.skus && product.skus.length > 0) {
          // Check if any SKU in this product starts with the same base SKU
          for (var i = 0; i < product.skus.length; i++) {
            if (product.skus[i] && product.skus[i].split("-")[0] === baseSku) {
              matchingProducts.push(product);
              break; // Found a match, no need to check other SKUs for this product
            }
          }
        }
      });
    }

    console.log(
      "Found matching products:",
      matchingProducts.length,
      manualColorGroup ? "(manual grouping)" : "(SKU-based grouping)"
    );

    // Extract colors and variants from matching products
    matchingProducts.forEach(function (product) {
      var color = null;

      // Try to get color from variants
      if (product.variants && product.variants.length > 0) {
        var mainVariant = product.variants[0];

        // Try to extract color from merged_options
        if (
          mainVariant.merged_options &&
          mainVariant.merged_options.length > 0
        ) {
          for (
            var optionIndex = 0;
            optionIndex < mainVariant.merged_options.length;
            optionIndex++
          ) {
            var optionStr = mainVariant.merged_options[optionIndex];
            if (typeof optionStr === "string") {
              var parts = optionStr.split(":");
              if (parts.length === 2) {
                var optionName = parts[0].toLowerCase().trim();
                var optionValue = parts[1].trim();
                if (optionName.indexOf("color") !== -1) {
                  color = optionValue;
                  break;
                }
              }
            }
          }
        }

        // Try to extract color from options_with_values
        if (!color && product.options_with_values) {
          var colorOption = product.options_with_values.find(function (opt) {
            return opt.name && opt.name.toLowerCase().indexOf("color") !== -1;
          });
          if (colorOption && colorOption.values && colorOption.values[0]) {
            color = colorOption.values[0];
          }
        }

        // Fallback to option1/option2/option3
        if (!color) {
          color =
            mainVariant.option1 || mainVariant.option2 || mainVariant.option3;
        }
      }

      // If we found a color, add it to our list
      if (color) {
        var colorExists = allColors.find(function (c) {
          return c.color.toLowerCase() === color.toLowerCase();
        });

        if (!colorExists) {
          allColors.push({
            color: color,
            colorPart: product.handle,
            product: product,
          });
          variantsByColor[color] =
            product.variants && product.variants.length > 0
              ? product.variants[0]
              : null;
        }
      }
    });

    // Sort colors so current product's color is first
    var currentColor = null;
    if (data.variants && data.variants.length > 0) {
      var mainVariant = data.variants[0];
      if (mainVariant.merged_options && mainVariant.merged_options.length > 0) {
        for (
          var optionIndex = 0;
          optionIndex < mainVariant.merged_options.length;
          optionIndex++
        ) {
          var optionStr = mainVariant.merged_options[optionIndex];
          if (typeof optionStr === "string") {
            var parts = optionStr.split(":");
            if (parts.length === 2) {
              var optionName = parts[0].toLowerCase().trim();
              var optionValue = parts[1].trim();
              if (optionName.indexOf("color") !== -1) {
                currentColor = optionValue;
                break;
              }
            }
          }
        }
      }
      if (!currentColor) {
        currentColor =
          mainVariant.option1 || mainVariant.option2 || mainVariant.option3;
      }
    }

    if (currentColor) {
      // Remove current color from array and add to front
      allColors = allColors.filter(function (c) {
        return c.color.toLowerCase() !== currentColor.toLowerCase();
      });
      allColors.unshift({
        color: currentColor,
        colorPart: data.handle,
        product: data,
      });
      variantsByColor[currentColor] = data.variants[0];
    }

    // Build swatch HTML only if we have multiple colors
    var itemSwatchHtml = "";
    if (allColors.length > 1) {
      console.log("Building swatches for", allColors.length, "colors");

      var color_name =
        boostPFSThemeConfig.custom.section_id + "-" + data.id + "-" + indx;

      for (var colorIndex = 0; colorIndex < allColors.length; colorIndex++) {
        var colorValue = allColors[colorIndex].color;
        var colorPart = allColors[colorIndex].colorPart;
        var productForColor = allColors[colorIndex].product;
        var colorValueLower = colorValue.toLowerCase();
        var variantForColor = variantsByColor[colorValue];

        if (variantForColor && productForColor) {
          // Get image info for this variant
          var imageInfo = null;
          var image_aspect_ratio = 1;

          if (variantForColor.image) {
            imageInfo =
              productForColor.images_info &&
              productForColor.images_info.find(function (imageOb) {
                return imageOb.src === variantForColor.image;
              });
          }

          if (
            !imageInfo &&
            productForColor.images_info &&
            productForColor.images_info.length > 0
          ) {
            imageInfo = productForColor.images_info[0];
          }

          if (!imageInfo) {
            imageInfo = {
              src: boostPFSConfig.general.no_image_url,
              id: variantForColor.id,
              width: 480,
              height: 480,
            };
          }

          if (imageInfo) {
            image_aspect_ratio = imageInfo.width / imageInfo.height;
          }

          // Build swatch HTML
          var size = "200,400,600,700,800,900,1000,1200";
          var supported_sizes = imageSize(size, imageInfo);
          var color_input_id = color_name + "-" + colorIndex;
          var checked = colorIndex === 0 ? "checked=checked" : "";

          var dataImg = imageInfo
            ? '" data-image-url="' +
              imageInfo.src +
              '" data-image-widths="[' +
              supported_sizes +
              ']" data-image-aspect-ratio="' +
              image_aspect_ratio +
              '" data-image-id="' +
              imageInfo.id +
              '"'
            : "";

          // Try to get color swatch image
          var newurlcolor = Utils.getFilePath(
            Utils.slugify(colorValue),
            Globals.swatchExtension,
            Settings.getSettingValue("general.swatchImageVersion")
          );

          itemSwatchHtml += '<div class="ProductItem__ColorSwatchItem">';
          itemSwatchHtml +=
            '<input class="ColorSwatch__Radio" type="radio" ' +
            checked +
            ' name="' +
            color_name +
            '" id="' +
            color_input_id +
            '" value="' +
            colorValue +
            '" data-image-aspect-ratio="' +
            image_aspect_ratio +
            '" data-variant-price="' +
            (variantForColor.price || 0) +
            '" data-variant-compare-at-price="' +
            (variantForColor.compare_at_price || 0) +
            '" data-variant-url="' +
            Utils.buildProductItemUrl(productForColor) +
            "?variant=" +
            variantForColor.id +
            (imageInfo ? "#Image" + imageInfo.id : "") +
            '"' +
            dataImg +
            ' aria-hidden="true">';

          itemSwatchHtml +=
            '<label class="ColorSwatch ColorSwatch--small' +
            (colorValueLower === "white" ? " ColorSwatch--white" : "") +
            '" for="' +
            color_input_id +
            '" style="border-radius: 50%; background-color: ' +
            colorValueLower.replace(/\s/g, "") +
            "; background-image: url(" +
            newurlcolor +
            ')" title="' +
            colorValue +
            '" data-colorPart="' +
            colorPart +
            '" data-tooltip="' +
            Utils.capitalize(colorValue, true, true) +
            '"><span class="u-visually-hidden">' +
            colorValue +
            "</span></label>";

          itemSwatchHtml += "</div>";
        }
      }
    }

    return itemSwatchHtml;
  }

		// Function to bind click events to newly created swatches

		 function bindSwatchClickEvents(container) {
    var swatches = container.querySelectorAll("label.ColorSwatch");
    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", async function () {
        console.log("Fetched swatch clicked!");

        try {
          const res = await fetch(
            `/products/${this.getAttribute("data-colorPart")}.js`
          );
          const productData = await res.json();
          const images = productData.images;

          // Remove active class from all swatches in the same group
          container.querySelectorAll("label.ColorSwatch").forEach(function (s) {
            s.classList.remove("active");
          });

          // Add active class to clicked swatch
          this.classList.add("active");

          // Find the closest product wrapper and update images/info
          var productWrapper =
            this.closest(".ProductItem__Wrapper") ||
            this.closest(".ProductItem");
          if (productWrapper && images && images.length > 0) {
            var mainImage = productWrapper.querySelector(
              "img.ProductItem__Image:not(.ProductItem__Image--alternate)"
            );
            if (mainImage) {
              // Update main image with all necessary attributes
              mainImage.classList.remove("Image--fadeIn");
              mainImage.src = images[0];
              mainImage.setAttribute("data-src", images[0]);
              mainImage.setAttribute("srcset", images[0]);
              mainImage.setAttribute("data-srcset", images[0]);
              mainImage.classList.remove(
                "Image--lazyLoad",
                "lazyautosizes",
                "Image--lazyLoaded"
              );
              mainImage.style.display = "block";
              // Don't remove style attribute here since we need to set styles after

              setTimeout(function () {
                mainImage.classList.add("Image--fadeIn");
                mainImage.style.opacity = "1";
                mainImage.style.visibility = "visible";
                mainImage.style.display = "block";
              }, 50);
            }

            // Update alternate image if exists
            if (images.length > 1) {
              var altImage = productWrapper.querySelector(
                "img.ProductItem__Image--alternate"
              );
              if (altImage) {
                // Update alternate image with all necessary attributes
                altImage.classList.remove("Image--fadeIn");
                altImage.src = images[1];
                altImage.setAttribute("data-src", images[1]);
                altImage.setAttribute("srcset", images[1]);
                altImage.setAttribute("data-srcset", images[1]);
                altImage.classList.remove(
                  "Image--lazyLoad",
                  "lazyautosizes",
                  "Image--lazyLoaded"
                );
                altImage.style.display = "block";
                // Don't remove style attribute here since we need to set styles after

                setTimeout(function () {
                  altImage.classList.add("Image--fadeIn");
                  altImage.style.opacity = "1";
                  altImage.style.visibility = "visible";
                  altImage.style.display = "block";
                }, 50);
              }
            }

            // Update product links
            var productUrl = `/products/${productData.handle}`;
            var imageLink = productWrapper.querySelector(
              "a.ProductItem__ImageWrapper"
            );
            var titleLink = productWrapper.querySelector(
              ".ProductItem__Title a"
            );

            if (imageLink) imageLink.href = productUrl;
            if (titleLink) {
              titleLink.href = productUrl;
              titleLink.textContent = productData.title;
            }

            // Update price - Get the first variant from the response
            var variant =
              productData.variants && productData.variants.length > 0
                ? productData.variants[0]
                : null;

            if (variant) {
              // Clone the product object to avoid mutating the original
              var productForPrice = Object.assign({}, productData);
              productForPrice.price_min = variant.price / 100;
              productForPrice.price_max = variant.price / 100;
              productForPrice.compare_at_price_min = variant.compare_at_price
                ? variant.compare_at_price / 100
                : null;
              productForPrice.compare_at_price_max = variant.compare_at_price
                ? variant.compare_at_price / 100
                : null;
              productForPrice.available = variant.available;

              // Set global sale state for price building
              var wasOnSale = onSale;
              onSale = variant.compare_at_price > variant.price;

              // Build and update price display
              var variantPrice = buildPrice(productForPrice);
              var priceContainer = productWrapper.querySelector(
                ".ProductItem__PriceList"
              );
              if (priceContainer) {
                priceContainer.innerHTML = variantPrice;
              }

              // Restore original sale state
              onSale = wasOnSale;
            }
          }
        } catch (error) {
          console.error("Error updating product on swatch click:", error);
        }
      });
    });
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

	 // Pre-fetch products data before rendering starts
  ProductList.prototype.beforeRender = function (data, eventType) {
    if (!data) data = this.data;
    if (!eventType) eventType = this.eventType;

    // Start fetching products data early so it's available for swatches
    console.log("Pre-fetching products data for swatches...");
    fetchAllProductsOnce();
  };

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
		jQ(
      ".ProductItem__Info .ProductItem__ColorSwatchList .ProductItem__ColorSwatchItem label.ColorSwatch"
    ).click(async function () {
      console.log("Swatch clicked!");

      // Log the clicked element and its data
      console.log("Clicked element:", this);
      console.log("Clicked element data:", jQ(this).data());

      const res = await fetch(
        `/products/${jQ(this).data("colorpart")}.js`
      ).then((response) => response.json());

      const images = res.images;
      console.log("Fetched images:", images);

      // Remove active class from all swatches in the same group
      jQ(this)
        .parent()
        .parent()
        .find("label.ColorSwatch")
        .removeClass("active");

      // Add active class to clicked swatch
      jQ(this).addClass("active");

      // Find the closest product wrapper and main image
      var productWrapper = jQ(this).closest(".ProductItem__Wrapper");
      var mainImage = productWrapper.find(
        "img.ProductItem__Image:not(.ProductItem__Image--alternate)"
      );
      console.log("Main image element:", mainImage);

      // Update product title
      var productTitle = productWrapper.find(".ProductItem__Title a");
      if (productTitle.length && res.title) {
        productTitle.text(res.title);
        productTitle.attr(
          "aria-label",
          "Click here to view " + res.title + " detail page"
        );
      }

      // Update product URL
      var productUrl = `/products/${res.handle}`;
      productWrapper
        .find("a.ProductItem__ImageWrapper")
        .attr("href", productUrl);
      productTitle.attr("href", productUrl);

      if (images && images.length > 0) {
        // Main image
        if (mainImage.length) {
          mainImage.off("load");
          mainImage.removeClass("Image--fadeIn");
          mainImage.attr("src", images[0]);
          mainImage.attr("data-src", images[0]);
          mainImage.attr("srcset", images[0]);
          mainImage.attr("data-srcset", images[0]);
          mainImage.removeClass(
            "Image--lazyLoad lazyautosizes Image--lazyLoaded"
          );
          mainImage.show();
          // Don't remove style attribute here since we need to set styles after
          setTimeout(function () {
            mainImage.addClass("Image--fadeIn");
            mainImage.css({
              opacity: 1,
              visibility: "visible",
              display: "block",
            });
          }, 50);
        }

        // Alternate image
        if (images.length > 1) {
          var altImage = productWrapper.find(
            "img.ProductItem__Image--alternate"
          );
          if (altImage.length) {
            altImage.off("load");
            altImage.removeClass("Image--fadeIn");
            altImage.attr("src", images[1]);
            altImage.attr("data-src", images[1]);
            altImage.attr("srcset", images[1]);
            altImage.attr("data-srcset", images[1]);
            altImage.removeClass(
              "Image--lazyLoad lazyautosizes Image--lazyLoaded"
            );
            altImage.show();
            // Don't remove style attribute here since we need to set styles after
            setTimeout(function () {
              altImage.addClass("Image--fadeIn");
              altImage.css({
                opacity: 1,
                visibility: "visible",
                display: "block",
              });
            }, 50);
          }
        }
      }

      // Update price
      var variantPrice = "";

      // Get the first variant from the response
      var variant =
        res.variants && res.variants.length > 0 ? res.variants[0] : null;

      if (variant) {
        // Clone the product object to avoid mutating the original
        var productForPrice = Object.assign({}, res);
        productForPrice.price_min = variant.price / 100;
        productForPrice.price_max = variant.price / 100;
        productForPrice.compare_at_price_min = variant.compare_at_price
          ? variant.compare_at_price / 100
          : null;
        productForPrice.compare_at_price_max = variant.compare_at_price
          ? variant.compare_at_price / 100
          : null;
        productForPrice.available = variant.available;

        if (variant.compare_at_price > variant.price) {
          onSale = true;
        }

        // Now use the full product object with updated prices
        variantPrice = buildPrice(productForPrice);
      }

      // Update price display
      productWrapper.find(".ProductItem__PriceList").html(variantPrice);

      // Add fade-in class to product wrapper
      productWrapper
        .find(".AspectRatio, .ProductItem__ImageWrapper")
        .addClass("is-visible");
    });
  };

	// Build additional elements
	FilterResult.prototype.afterRender = function(data, eventType) {
		if (!data) data = this.data;
		if (!eventType) eventType = this.eventType;
		  // Update boostPFSFilterProducts with the current products
    if (data && data.products) {
      updateBoostPFSFilterProducts(data.products);
    }

    // Hide loading state after render completes
    jQ(".boost-pfs-filter-loading").hide();


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
