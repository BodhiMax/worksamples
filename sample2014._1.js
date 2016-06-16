
/**

Sample of jquery work. This is preparing a file transfer package and responding to return results to initiate the transfers

File has been modified to remove potentially sensitive client logic, including renaming objects and properties

**/

if (typeof AW !== 'object') { AW = {}; }

$.support.cors = true;

var transferId;
var holder = [];
var isWin = (navigator.appVersion.indexOf('Win') !== -1) ? 1 : 0;
var isIE = navigator.appName === 'Microsoft Internet Explorer' ? 1 : 0;

var setup = function () {

	var uploadButton = document.getElementById('drop-link');
    uploadButton.className = 'upload_button';
	 
	if (isWin) {
		someappFFT = new AW.Connect({
			id:'someapp_fft_transfers',
			containerId:'draganddrop',
			dropMode:'callback',
			height:'142',
			width:'198',
			image:'https://' + '%%APACHE_SERVER_NAME%%' + '/nkdropbox/img/aspfill.jpg',
			imageCover:'https://' + '%%APACHE_SERVER_NAME%%' + '/nkdropbox/img/aspfill.jpg',
			dropAllowDirectories: 'true',
			dropAllowMultiple: 'true'
		});
		if(isIE) {
			$('a.upload_button').click( function(e) {
				e.preventDefault();
				e.stopPropagation();
				someappFFT.showSelectFileDialog({success:fileControls.buildPaths});
			});
			$('#button_container').click( function(e) {
				e.preventDefault();
				e.stopPropagation();
				$('a.upload_button').trigger('click');
			});
	 	}
	 	else {
	 		uploadButton.setAttribute('onclick', 'someappFFT.showSelectFileDialog({success:fileControls.buildPaths})');
	 	}
	 }
	 else {
		someappFFT = new AW.Connect({
			id:'someapp_fft_transfers',
			containerId:'draganddrop',
			dropMode:'callback',
			height:'161',
			width:'198',
			dropAllowDirectories: 'true',
			dropAllowMultiple: 'true'
		});
		uploadButton.setAttribute('onclick', 'someappFFT.showSelectFileDialog({success:fileControls.buildPaths})');
	 }
	 
	fileControls.setupDrop(someappFFT);
 
    //var uploadButton = document.getElementById('drop-link');
    //uploadButton.className = 'upload_button';
	//uploadButton.setAttribute('onclick', 'someappFFT.showSelectFileDialog({success:fileControls.buildPaths})');
 
   	someappFFT.initSession();
	someappFFT.addEventListener('transfer', fileControls.handleTransferEvents, 1); 
};

$('#someapp_fft_transfers').css('visibility','hidden');

returnData = {};
var fileConform = {"transferPaths":[]};
var fileConformT;

fileControls = {};

response = undefined;

var transferSpec = {
	"paths": [],
	"resume" : "sparse_checksum",
	"authentication" : "token"
};

$('#send-package').click( function(e, pathArray) {
	e.preventDefault();
	fileControls.uploadFiles(pathArray);
});
$('#cancel-send').click( function(e) {
	e.preventDefault();
	fileControls.cancelTrans();
	$('#remove-all').trigger('click');
	$('#send-packages').removeClass('paused transferring').addClass('hide-step').attr('aria-hidden', 'true');
	$('section.step2').addClass('add-step');
	$('ul.add-files').removeClass('accessible').removeAttr('aria-hidden');
});
$('#package-done').click( function(e) {
	e.preventDefault();
	$('#remove-all ').trigger('click');
	$('#send-packages').removeClass('completed').addClass('hide-step ready').attr('aria-hidden', 'true');
	$('section.step2').addClass('add-step');
	$('#dropboxes tr.row_selected').trigger('click');
	$('ul.add-files').removeClass('accessible').attr('aria-hidden', 'false');
	$('div.menu-help').accordion( "option", "active", 0 );
	$('section.step1').focus();
});
$('#send-pause').click( function(e) {
	e.preventDefault();
	fileControls.pauseTrans();
	$('#send-packages').removeClass('transferring').addClass('paused');
	$('ul.add-files').removeClass('accessible').attr('aria-hidden', 'false');
});
$('#send-resume').click( function(e) {
	e.preventDefault();
	fileControls.resumeTrans();
	$('#send-packages').removeClass('paused').addClass('transferring');
	$('ul.add-files').addClass('accessible').attr('aria-hidden', 'true');
});

fileControls.buildPaths = function (pathArray ) {

    $('section.step2').removeClass('add-step');
    $('#send-packages').removeClass('hide-step').attr('aria-hidden', 'false');
    
    $('html, body').animate({
		scrollTop: $('#package-contents').offset().top
	}, 650);
    
    for (var i = 0, length = pathArray.length; i < length; i++) {
    	var fileInfo = pathArray[i];
    	var splitter = fileInfo.indexOf('\\') >= 0 ? '\\':'/';
    	var fileName = fileInfo.substr(fileInfo.lastIndexOf(splitter) +1);
    	var fileDelete = '<a class=\"active\" href=\"#\" id=\"rowmod' + i + '\"><span>Delete</span></a>';
    	
    	$('#package-contents').dataTable().fnAddData( [
		fileName,
		//fileSize,
		//fileStatus,
		fileDelete,
		fileInfo ] );
		
		holder.push({"source":fileInfo, "destination":fileName});
    }
    
    $('#package-contents tbody tr td:nth-child(2)').each( function() {
		$(this).addClass('remove-row');
	});
    
    $('#package-contents_wrapper tr th:nth-child(3), #package-contents_wrapper tr td:nth-child(3)').each( function() {
		$(this).css('display', 'none');
	});
    
    transferSpec.paths = holder;
    fileConform.transferPaths = holder;
    fileConformT = JSON.stringify(fileConform, null, "");
    
    $('#package-contents tbody tr').each( function() {
    	var titleString = $(this).children('td:nth-child(3)').html();
    	$(this).children(':first').attr('title', titleString);
    });
    
    $('#package-contents a').each( function() {
    	$(this).unbind('click');
    	$(this).click( function (e) {
    		e.preventDefault();
    		var path = $(this).parent('td').siblings('td:first-child').attr('title');
    		
    		holder = $.grep(holder, function(h) {return h.source != path});
    		transferSpec.paths = $.grep(transferSpec.paths, function(p) {return p.source != path});
    		pathArray = $.grep(pathArray, function(a) {return a != path});
    		fileConform.transferPaths = $.grep(fileConform.transferPaths, function(f) {return f.source != path});
    		
    		fileConformT = JSON.stringify(fileConform, null, "");
    		var pTable = $('#package-contents').dataTable();
    		var pathposition = $(this).closest('td').parent()[0].sectionRowIndex;

    		pTable.fnDeleteRow(pathposition);
    		
    		if ($('#package-contents tbody td').hasClass('dataTables_empty')) {
    			$('#send-packages').addClass('hide-step').attr('aria-hidden', 'true');
    		}
    		
    	});
    });
    
    $('#remove-all').click( function(e) {
    	e.preventDefault();
    	
    	for (var t = 0, tlength = holder.length; t < tlength; t++) { delete holder[t]; }
    	fileConform.transferPaths = transferSpec.paths = holder =  [];
    	fileConformT = JSON.stringify(fileConform, null, "");
    	$('#send-packages').addClass('hide-step').attr('aria-hidden', 'true');
    	
    	var pTable = $('#package-contents').dataTable();
    	pTable.fnClearTable();
    });
    
};

fileControls.setupDrop = function(connectObj) {
	connectObj.addEventListener('drop', function(eventType, data) {
		fileControls.buildPaths(data);
	});
};
 
fileControls.uploadFiles = function (pathArray) {
	
	var buildaccess = $.parseJSON($.cookie('dpbconfig'));
	
	var transSpecConfig = $.ajax({
		type: 'POST',
		url: $.cookie('dpbtransconfig'),
		cache: false,
		contentType: 'ENDPOINT WAS HERE',
		dataType: 'json',
		//data: fileConform,
		data: fileConformT,
		headers: {
			'Authorization' : '  ' +  buildaccess.rememberMeAuthorization ,
			'Accept' : 'ENDPOINT WAS HERE'
		}
	});

	transSpecConfig.done (function( data ) {
	
		var returnData = data.data;
		var returnPaths = data.data.paths;
		for (p in returnPaths) {
			transferSpec.paths[p]['source'] = returnPaths[p]['source'];
			transferSpec.paths[p]['destination'] = returnPaths[p]['destination'];
		}
		transferSpec.cipher =  returnData.cipher;
		transferSpec.destination_root = returnData.destinationRoot;
		transferSpec.direction = returnData.direction;
		transferSpec.fasp_port = returnData.faspPort;
		transferSpec.remote_host = returnData.remoteHost;
		transferSpec.remote_user = returnData.remoteUser;
		transferSpec.ssh_port = returnData.sshPort;
		transferSpec.target_rate_kbps = returnData.targetRateKiloBytesPerSecond;
		transferSpec.token = returnData.token;
    	
		connectSettings = {
			"allow_dialogs": "yes"
		};
		
		$('#package-contents tbody td:nth-child(2)').each( function() {
			$(this).addClass('disabled').html('<span> </span>');
		});

		response = someappFFT.startTransfer(transferSpec, connectSettings);
		transferRequestId = response.request_id;
    	
	});

	transSpecConfig.fail (function( data ) {
		console.log(data);
	});

	transSpecConfig.always (function( data ) {
		//console.log(data);
	});

};

fileControls.handleTransferEvents = function (event, obj) {
    
    switch (event) {
        case 'transfer':
            var jsonObj = eval(obj);
            var reqid = jsonObj.aspera_connect_settings.request_id;
            var xferid = jsonObj.transfer_spec.tags.aspera.xfer_id;
            var appid = jsonObj.aspera_connect_settings.app_id;
            
            if(!(typeof reqid === 'undefined' || reqid == null) && (reqid == transferRequestId)) {
            	transferId = xferid;
				var xferstatus = jsonObj.status;
				switch (xferstatus) {
					case 'completed':
						$('#package-contents tbody td:nth-child(2)').each( function() {
    						$(this).removeClass('disabled').addClass('done');
    					});
						$('#send-packages').removeClass('paused transferring').addClass('completed');
						for (var t = 0, tlength = holder.length; t < tlength; t++) {
							delete holder[t];
						}
						transferSpec.paths.length = 0;
						fileConform.transferPaths.length = 0;
						fileConformT = '';
						break;
					case 'failed':
						var xferErrorDesc = jsonObj.error_desc;
						$('ul.add-files').removeClass('accessible').attr('aria-hidden', 'false');
						
						console.log('RequestId ' + reqid + ' failed [' + xferErrorDesc + '] ');
						break;
					case 'initiating':
							$('ul.add-files').addClass('accessible').attr('aria-hidden', 'true');
							//$('#send-packages').removeClass('ready').addClass('transferring');
							$('#send-packages').removeClass('ready');
						break;
					default:
						//default UI display changes could go here (eg create display meter)
				}
              
            }
            break; 
    }
};

fileControls.cancelTrans = function () {
    if(!(typeof transferId === 'undefined' || transferId == null)) {
      var result = someappFFT.removeTransfer(transferId);
    }
};

fileControls.pauseTrans = function () {
    if(!(typeof transferId === 'undefined' || transferId == null)) {
      var result = someappFFT.stopTransfer(transferId);
    }
};

fileControls.resumeTrans = function () {
    if(!(typeof transferId === 'undefined' || transferId === null)) {
      var result = someappFFT.resumeTransfer(transferId);
    }
};