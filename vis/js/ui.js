$(document).ready(function(){
    $("a#panel_toggle").click(function(){
        var panel = $("#panel");
        if (panel.attr("class") == "folded") {
            $(".section").not("#title").slideDown();
            $("#title").removeClass("last");
            panel.attr("class", "unfolded");
        }
        else {
            $(".section").not("#title").slideUp();
            $("#title").addClass("last");
            panel.attr("class", "folded");
        }
    });
});
