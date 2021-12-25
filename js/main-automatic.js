var kinetic, trackSessionId;

var options = {
	debug: true,
	// trackingTimeSensitivity: 10,
	// autoTracking: false,
	// autoTrackingInterval: 5000,
	trackingElement: '#trackarea'
}

$(document).ready(function(){
	
	kinetic = new ZFS.KineticTracker(options);
	
	kinetic.init();
	
	//Populate old results
	populateResult();
	
	if (typeof options.autoTracking == 'undefined' || options.autoTracking == true) {	
		$("#startTracking").hide();
		$("#stopTracking").hide();
		$("#showData").show();
		
	} else {
		$("#startTracking").show();
		$("#stopTracking").hide();		
		$("#showData").hide();
	}

	$("#trackarea").on("mousemove", function(e){
		if(trackSessionId) {
			$("#pointer").css("left",e.pageX);
			$("#pointer").css("top",e.pageY);
		} else {
			$("#pointer").css("left",0);
			$("#pointer").css("top",0);
		}
	});
})

function getResults(){
	var x = JSON.parse(kinetic.getTrackData());
	var y = {};

	trackSessionId = null;
	
	if(localStorage.getItem('records')) {
		try {
			y = JSON.parse(localStorage.getItem('records'));
		} catch (e) {
			// Do nothing
		}
	}
	
	var combData = $.extend(y,x.data);
	localStorage.setItem('records',JSON.stringify(combData));	
	
	$('.nav-tabs a[href="#data"]').tab('show');
}