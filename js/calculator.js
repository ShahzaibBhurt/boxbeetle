(function($, window, document, undefined) {
    // Global Constants
    const $DOM = {
        win:     $(window),
        doc:     $(document),
        htmlTag: $('html,body'),
        bodyTag: $('body')
    }

    $( document ).ready(function() {
        $("div").find('.ui-slider-range-max')[0].remove()
        $(this).Calculator();
    });



    $.fn.Calculator = function () {
        const $container = $('#calculator'),
            $wrapper = $('.calc-wr'),
            $submit = $('#calc-sb'),
            $reset = $('#calc-rs'),
            $slider = $container.find('#weight-slider'),
            fields = {
                weight :            [
                    $container.find('input[name=weight]'), //hidden input
                    $container.find('#weight-sl--vl'), //visible span
                ],
                size:          $container.find('select[name=size]'),
                length :       $container.find('input[name=length]'),                
                width :       $container.find('input[name=width]'),
                height :       $container.find('input[name=height]'),                
                weight_unit :       $container.find('input[name=unit]'),
                price :          $container.find('input[name=price]'),
                service :            4.99//$container.find('input[name=service]')
            }

        if(!$container.length && !$submit.length) {
            return false;
        }


        InitSlider();
        //InputValidation(fields.width);
        $submit.on('click', function (e) { e.preventDefault(); ValidateForm(); })
        $reset.on('click', function (e) {ResetForm(); });
        EmbedPopup($DOM, $wrapper);



        function InitSlider () {

            if (!$slider.length) {
                return false;
            }
            var $toggle_checked = $container.find('input[name=unit]:checked'),
                attributes = {
                    range:           $slider.data('range'),
                    min:             $slider.data('min'),
                    max:             $slider.data('max'),
                    step:            $slider.data('step'),
                    value:           10,
                    type:            $toggle_checked.val()
                };

            /*Set initial value for input field*/
            fields.weight[0].attr('value', attributes.value);

            /*Get input value*/
            fields.weight[0].on('keyup', function (event) {
                var $this = $(this);
                attributes.value = parseFloat($this.val(), 10);
                var _min = parseFloat($this.attr('min'), 10);

                if (attributes.value >= _min) {
                    fields.weight[1].text(attributes.value);
                    $slider.slider('value', attributes.value);
                }
            });

            /*Slider init*/
            $slider.slider({
                range:              attributes.range,
                min:                attributes.min,
                max:                attributes.max,
                step:               attributes.step,
                value:              attributes.value,
                create:             function (event, ui) {
                    fields.weight[1].text(attributes.value);
                },
                slide:              function (event, ui) {
                    attributes.value = ui.value;
                    fields.weight[1].text(ui.value);
                    fields.weight[0].val(ui.value);
                    $slider.find('.val-tooltip .val').html(ui.value);
                }
            });


            var $handler = $slider.find('.ui-slider-handle');
            $handler.append("<div class='val-tooltip'><span class='val'>"+$slider.slider('value')+"</span><span class='arrow'></span></div>");

            /*Convert to selected unit*/
            fields.weight_unit.on('change', function () {
                if ($(this).is(':checked')) {
                    var unit = $(this).val();
                    //alert(attributes.value)
                    attributes.type = unit;
                    if (unit == 'lb') {
                        attributes.value = (attributes.value * 2.205).toFixed();
                        attributes.max = (attributes.max * 2.205).toFixed();
                    }
                    if (unit == 'kg') {
                        attributes.value = (attributes.value / 2.205).toFixed();
                        attributes.max = (attributes.max / 2.205).toFixed();
                    }
                    fields.weight[0].val(attributes.value);
                    fields.weight[1].text(attributes.value);
                    $slider.slider({'value': attributes.value, 'max': attributes.max});
                }
            });
            /*Allow to input only numbers */
            InputValidation(fields.weight[0]);
            
        }

        function ValidateForm () {
            var results = getResults();

            var error = '<div class="calc-error">*This field is required</div>';
            var message = '<div class="calc-message">*Please fill in this field</div>';

            var calculate = false;

            if (results.weight[0] == 0) {
                calculate = false;
                fields.weight[0].parent().siblings('.calc-error').length == 0 ? $(error).insertBefore(fields.weight[0].parent().siblings('.calc--lb')).hide().slideDown(300) : "";
            }
            else {
                calculate = true;
                fields.weight[0].parent().siblings('.calc-error').length != 0 ? fields.weight[0].parent().siblings('.calc-error').remove() : "";
            }

            if (results.strength == 0) {
                calculate = false;
                fields.strength.parent().siblings('.calc-error').length == 0 ? $(error).insertBefore(fields.strength.parent().siblings('.calc--lb')).hide().slideDown(300) : "";
            }
            else {
                calculate = true;
                //fields.strength.parent().siblings('.calc-error').length != 0 ? fields.strength.parent().siblings('.calc-error').remove() : "";
            }

            // if (results.totalcbd == 0 && results.volume != 0) {
            //     calculate = false;
            //     fields.totalcbd.parent().siblings('.calc-message').length == 0 ? $(message).insertBefore(fields.totalcbd.parent().siblings('.calc--lb')).hide().slideDown(300) : "";
            // }
            // else {
            //     fields.totalcbd.parent().siblings('.calc-message').length != 0 ? fields.totalcbd.parent().siblings('.calc-message').remove() : "";
            // }
            //
            // if (results.volume == 0 && results.totalcbd != 0) {
            //     calculate = false;
            //     fields.volume.parent().siblings('.calc-message').length == 0 ? $(message).insertBefore(fields.volume.parent().siblings('.calc--lb')).hide().slideDown(300) : "";
            // }
            // else {
            //     fields.volume.parent().siblings('.calc-message').length != 0 ? fields.volume.parent().siblings('.calc-message').remove() : "";
            // }

            calculate ? CalculateResults(results) : alert("else");
        }

        function ResetForm ($res_reset=false) {
            fields.weight[0].val(50);
            fields.weight[1].text(fields.weight[0].val());
            $slider.slider('value', fields.weight[0].val());
            InitSlider();
            $container.children().show();

            if ($container.find('.calc-results').length > 0) {
                $container.find('.calc-results').remove();
                $container.css('height', 'auto');
                $container.children().fadeIn(300);
                $('.calc-actions').fadeIn(300);
            }

            if ($res_reset) $reset.trigger('click');

            $container.find('.calc-error').slideUp(300, function() { $(this).remove(); });
            $container.find('.calc-message').slideUp(300, function() { $(this).remove(); });
        }

        function getResults () {

            var weight_unit = fields.weight_unit.filter(":checked").val() == "kg" ? 1 : fields.weight_unit.filter(":checked").val() == "lb" ? 2.205 : 0;
            return {
                weight :         fields.weight[0].val() ? parseFloat((fields.weight[0].val()/weight_unit).toFixed()) : 0,
                size :           fields.size.val() ? fields.size.val() : 'in',                
                length :         fields.length.val() ? parseFloat(fields.length.val()) : 0,                
                width :          fields.width.val() ? parseFloat(fields.width.val()) : 0,                
                height :         fields.height.val() ? parseFloat(fields.height.val()) : 0,
                price :          fields.price.val() ? parseFloat(fields.price.val()) : 0, 
                service :        fields.service ? parseFloat(fields.service) : 0,
            };
        }

        function CalculateResults (results) {
            
            var $size = results.size,
                $length = results.length,
                $width = results.width,
                $height = results.height,
                $weight = results.weight,
                $price = results.price,
                $service = results.service;
            
            var $dimensions = 0;
            
            if($size === 'in'){
                $dimensions = parseFloat($length * $width * $height)
            }else if($size === 'ft'){
                $dimensions = parseFloat(($length*12) * ($width*12) * ($height*12)).toFixed(2)
            }else if($size === 'cm'){
                $dimensions = parseFloat(($length/2.54) * ($width/2.54) * ($height/2.54)).toFixed(2)
            }
            
            var $ic = parseFloat($dimensions / 0861),
                $sw = 0,
                $sp = parseFloat(($dimensions * 2) / 186),                
                $dc = parseFloat($dimensions / 349),
                $cs = parseFloat($price * 0.2),
                $sf = $service;

                $ic = ($ic < 1.10)?1.10:$ic;
                $sp = ($sp < 9.99)?9.99:$sp;
                $dc = ($dc < 7.49)?7.49:$dc;
            
            if(fields.weight_unit.filter(":checked").val() == "kg"){
                $sw = parseFloat(parseFloat(($weight * 2.205) * 16) * 0.19)
            }else{
                $sw = parseFloat(($weight * 16) * 0.19)
            }
            $sw = ($sw < 1)?1:$sw;

            var $results_reset = $('#calc-results-rs');

            /*var $output = '<ul>'+
                '<li>IC: '+parseFloat($ic).toFixed(2)+'</li>'+
                '<li>SW: '+parseFloat($sw).toFixed(2)+'</li>'+
                '<li>SP: '+parseFloat($sp).toFixed(2)+'</li>'+
                '<li>DC: '+parseFloat($dc).toFixed(2)+'</li>'+
                '<li>CS: '+parseFloat($cs).toFixed(2)+'</li>'+
                '<li>SF: '+parseFloat($sf).toFixed(2)+'</li>'+
                        '</ul>'*/

            var $output = '<div class="calc-results">';
            $output += '<p class="calc-results--title">Estimate Shipping Cost</p>';

            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>dimensions of the package ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat(parseFloat($sp)+parseFloat($dc)).toFixed(2) +
                '</div>' +
                '</div>';
            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>weight of the expected item ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat($sw).toFixed(2) +
                '</div>' +
                '</div>';
            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>US dollar value of the expected item ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat($cs).toFixed(2) +
                '</div>' +
                '</div>';
            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>Mandatory Insurance amount ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat($ic).toFixed(2) +
                '</div>' +
                '</div>';
            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>Mandatory Service Fee ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat($sf).toFixed(2) +
                '</div>' +
                '</div>';
            $output += '<div class="calc--r calc--r-dosecbd">' +
                '<div class="calc--lb"><div class="lb-tt"><span class="lb-icon lb-icon-volume"></span>Total Estimated cost ...</div>' +
                '</div>' +
                '<div class="calc-results--wr float-right">'+parseFloat(parseFloat($sp)+parseFloat($dc)+parseFloat($sw)+parseFloat($cs)+parseFloat($ic)+parseFloat($sf)).toFixed(2) +
                '</div>' +
                '</div>';
                $output += '<div class="b-reset">' +
                '                <span class="reset-icon"></span><input type="reset" id="calc-results-rs" name="reset" value="Calculate Again">' +
                '            </div>';
            $output += '</div>';

            var $height = $container.outerHeight();
            $container.children().hide();
            $('.calc-actions').hide();
            
            $container.css('height', $height).append($output).hide().fadeIn(150);
            var $res_reset = $container.find('#calc-results-rs');
            $res_reset.on('click', function (e) { ResetForm(true); })
        }
    }

    function InputValidation ($input) {
        $input.keypress(function(e) {
            return (e.charCode !=8 && e.charCode ==0 || (e.charCode >= 48 && e.charCode <= 57))
        });
    }

    function EmbedPopup ($DOM, $wrapper) {
        var $button = $wrapper.find('.embed-btn'),
            $overlay = $wrapper.find('.cta-overlay'),
            $close = $wrapper.find('.close-btn'),
            $tooltip = $wrapper.find('.cta-tooltip'),
            $modal = $wrapper.find('.cta-modal'),
            $content_embed = $wrapper.find('textarea#embed');


        $button.on('click', function () {
            $overlay.addClass("is-open");
            return false;
        });
        $close.on('click', function () {
            $overlay.removeClass("is-open");
        });

        $("button.copytoken").on('click', function (e) {
            $content_embed.select();
            document.execCommand("copy");

            $tooltip.fadeIn();

            $modal.css("padding-bottom","11rem");

            window.setTimeout( function(){
                $tooltip.fadeOut();
                if ($DOM.win.width()<=500) {
                    $modal.css("padding-bottom","1rem");
                } else $modal.css("padding-bottom","2rem");
            }, 5000 );
        });

        // //On clicking the modal background
        // $overlay.bind("click", function () {
        //     $overlay.removeClass("is-open");
        // });
    }

})(jQuery, window, document);