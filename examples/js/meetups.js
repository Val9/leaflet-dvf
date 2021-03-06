var lastMeetupLayer;
var map;

$(document).ready(function() {

	map = L.map('map').setView([0.0, 0.0], 2);
	
	L.tileLayer('http://{s}.tile.cloudmade.com/82e1a1bab27244f0ab6a3dd1770f7d11/998/256/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);
	
	var getGroups = function (topic, count, centerLatLng) {
			
		var data = {
			topic: topic,
			key: '2aa7c18485e27a1f39a4746226b',
			sign: true,
			page: count,
			ordering: 'members'
		};
		
		if (centerLatLng) {
			data['lat'] = centerLatLng.lat;
			data['lon'] = centerLatLng.lng;
		}

		$.ajax({
			url: 'http://api.meetup.com/2/groups',
			data: data,
			type: 'GET',
			dataType: 'jsonp',
			success: function (data) {
				if (lastMeetupLayer) {
					map.removeLayer(lastMeetupLayer);
				}
				
				var radiusFunction = new L.LinearFunction(new L.Point(5,5), new L.Point(10000,50));
				var colorFunction = new L.HSLHueFunction(new L.Point(0,360), new L.Point(5,200), {outputSaturation: '100%', outputLuminosity: '25%'});
				var fillColorFunction = new L.HSLHueFunction(new L.Point(0,360), new L.Point(5,200), {outputSaturation: '100%', outputLuminosity: '50%'});
				
				var options = {
					recordsField: 'results',
					latitudeField: 'lat',
					longitudeField: 'lon',
					displayOptions: {
						members: {
							displayName: 'Members',
							radius: radiusFunction
						},
						rating: {
							displayName: 'Rating',
							fillColor: fillColorFunction,
							color: colorFunction,
							displayText: function (value) {
								if (value === null) {
									value = 'N/A';
								}
								
								return value;
							}
						}
					},
					layerOptions: {
						weight: 1,
						fillOpacity: 0.7,
						opacity: 1.0,
						numberOfSides: 50
					},
					tooltipOptions: {
						iconSize: new L.Point(100,75),
						iconAnchor: new L.Point(-5,75)
					},
					onEachRecord: function (layer,record) {
						$html = L.HTMLUtils.buildTable(record);
						
						layer.bindPopup($html.wrap('<div/>').parent().html(),{
							minWidth: 400,
							maxWidth: 400
						});
					}
				};
				
				lastMeetupLayer = new L.DataLayer(data, options);
				
				map.addLayer(lastMeetupLayer);
				
				var $legend = $('#legend');
				
				$legend.empty();
				
				$legend.append(lastMeetupLayer.getLegend({
					className: 'well'
				}))
			}
		});
	};
	
	var $meetupTopic = $('#meetup-topic');
	var $findMeetupsButton = $('#find-meetups-button');
	
	$findMeetupsButton.on('click', function (e) {
		e.preventDefault();
	
		var topic = $meetupTopic.val();
		
		getGroups(topic, 200, map.getBounds().getCenter());
		
	});
});