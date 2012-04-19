/* Hardcode file names or URL below */
filename1 = "BackTransformedUPFFinalRotated_Endo.exdata";
filename2 = "BackTransformedUPFFinalRotated_Epi.exdata";
filename3 = "fitted_epi_humanLV.exelem";
filename4 = "fitted_epi_humanLV.exnode";
filename5 = "LVCanineModel_Transformed_EndoTrans.exelem";
filename6 = "LVCanineModel_Transformed_EndoTrans.exnode";
textureRegions = new Array();
stage = 0;
proteinNames = ["none","clcn1","SCN5A", "kvlqt1"];
cardiacModelNames = ["none", "biventricular", "One chamber", "LV", "RV", "full heart"];
wsGimiasURL = "http://ricordo.insigneo.org:9090/axis2/services/wsGimias";

function ShowHide(divId)
{
	if(document.getElementById(divId).style.display == 'none')
	{
		document.getElementById(divId).style.display='block';
	}
	else
	{
		document.getElementById(divId).style.display = 'none';
	}
}

function materialSetFieldImage(zincPlugin, region, material, name_series, start, end)
{
	var fieldModule = region.getFieldModule();
	xiField = fieldModule.findFieldByName("xi");
	var imageField = fieldModule.createImage(xiField);
	imageField.setName("sample_image");
	var downloadManager = zincPlugin.createDownloadManager();
	/* add in URIs for downloadManager to read files from.
	 	In this case files from the local directories. Each item stores
	 	a block of memory for each file. */
	var new_str = name_series;
	var i = 0;
	var numberOfItems = 0;
	var itemsArray = new Array();
	for (i = start; i <= end; i++)
	{
		new_str = new_str.replace("XXX", i.toString());
		itemsArray[numberOfItems] = downloadManager.addURI(new_str);
		new_str = name_series;
		numberOfItems++;
	}
	downloadManager.addCompletionCallback(
		getImageReadyFunction(material, imageField, itemsArray, numberOfItems));
}

function createTextureMaterial(graphicsModule, textureItem, textureNumber, imageField)
{
	var materialName = "textureMaterial"+textureNumber;
	var texture_material = graphicsModule.findMaterialByName(materialName);
	if (!texture_material)
	{
		texture_material = graphicsModule.createMaterial();
		texture_material.setName(materialName);
		texture_material.setAttributeReal3(texture_material.ATTRIBUTE.DIFFUSE, [1.0,1.0,1.0]);
		texture_material.setAttributeReal3(texture_material.ATTRIBUTE.AMBIENT, [1.0,1.0,1.0]);
		texture_material.setAttributeReal3(texture_material.ATTRIBUTE.SPECULAR, [1.0,1.0,1.0]);
	}
	var streamInformation = imageField.createStreamInformation();
	streamInformation.createResourceDownloadItem(textureItem);
	streamInformation.setFileFormat(streamInformation.FILE_FORMAT.PNG);
	imageField.read(streamInformation);
	texture_material.setImageField(1, imageField);
	imageField.setImageAttributeReal(imageField.IMAGE_ATTRIBUTE.PHYSICAL_WIDTH_PIXELS, 1.0);
	imageField.setImageAttributeReal(imageField.IMAGE_ATTRIBUTE.PHYSICAL_HEIGHT_PIXELS, 1.0);
	imageField.setImageAttributeReal(imageField.IMAGE_ATTRIBUTE.PHYSICAL_DEPTH_PIXELS, 1.0);

	return materialName;
}

function getDownloadsTextureReadyFunction(zincPluginIn, textureNumberIn, textureItemIn, textureNodeItemIn, textureElemItemIn)
{
	var zincPlugin = zincPluginIn;
	var textureNumber = textureNumberIn;
	var textureNodeItem = textureNodeItemIn;
	var textureElemItem = textureElemItemIn;
	var textureItem = textureItemIn;

	return function()
	{
		var rootRegion = zincPlugin.context.getDefaultRegion();
		var regionName = "textureBlock"+textureNumber;
		var texureRegion = rootRegion.createChild("textureBlock"+textureNumber);
		
		var regionStreamInformation = texureRegion.createStreamInformation();
		regionStreamInformation.createResourceDownloadItem(textureNodeItem);
		regionStreamInformation.createResourceDownloadItem(textureElemItem);
		texureRegion.read(regionStreamInformation);
		if (texureRegion)
		{
			var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
			var fieldModule = texureRegion.getFieldModule();
			var xiField = fieldModule.findFieldByName("xi");
			var imageField = fieldModule.createImage(xiField);
			imageField.setName("sample_image");
			var materialName = createTextureMaterial(graphicsModule, textureItem, textureNumber, imageField);
			var rendition = graphicsModule.getRendition(texureRegion);
			rendition.beginChange();
			rendition.executeCommand('cylinders constant_radius 0.3 select_on material green selected_material default_selected render_shaded');
			rendition.executeCommand('surfaces texture xi select_on material '+materialName);
			rendition.endChange();
			textureRegions.push(texureRegion);
		}
		zincPlugin.sceneViewer.viewAll();
	}			
}

function drawTexture()
{
	var zincPlugin = document.getElementById('zincplugin1');
	if (zincPlugin)
	{
		var baseURL = "ftp://ftp.bioeng.auckland.ac.nz/pub/ywan215/VisualisingDICOM/";
		var imageURL = "Image_PNG/SA_00X.png";
		var textureBoxURL = "TextureBox_PatientCoor/tex_block_SA_X";
		var i = 0;
		var new_str = null; 
		for (i = 1; i < 10; i++)
		{ 
			var downloadManager = zincPlugin.createDownloadManager();
			new_str = baseURL+imageURL;
			new_str = new_str.replace("X", i.toString());
			var textureItem = downloadManager.addURI(new_str);
			console.log(new_str);
			new_str = baseURL + textureBoxURL;
			new_str = new_str.replace("X", i.toString());
			var textureNodeItem = downloadManager.addURI(new_str+".exnode");
			console.log(new_str+".exnode");
			var textureElemItem = downloadManager.addURI(new_str+".exelem");
			downloadManager.addCompletionCallback(
				getDownloadsTextureReadyFunction(zincPlugin, i, textureItem, textureNodeItem, textureElemItem));
		}
	}
}

function getDownloadsPointReadyFunction(zincPluginIn, BTEndoItemIn, BTEpiItemIn)
{
	var zincPlugin = zincPluginIn;
	var BTEndoItem = BTEndoItemIn;
	var BTEpiItem = BTEpiItemIn;

	return function()
	{
		var rootRegion = zincPlugin.context.getDefaultRegion();
		var BT_epi_region = rootRegion.createChild("BT_epi");
		var BT_endo_region = rootRegion.createChild("BT_endo");
		var BTepistreamInformation = BT_epi_region.createStreamInformation();
		BTepistreamInformation.createResourceDownloadItem(BTEpiItem);
		BT_epi_region.read(BTepistreamInformation);
		var BTendostreamInformation = BT_endo_region.createStreamInformation();
		BTendostreamInformation.createResourceDownloadItem(BTEndoItem);
		BT_endo_region.read(BTendostreamInformation);

		var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
		if (BT_epi_region)
		{
			var rendition = graphicsModule.getRendition(BT_epi_region);
			rendition.beginChange();
			rendition.executeCommand('node_points glyph sphere general size "1*1*1" centre 0,0,0 select_on material blue');
			rendition.endChange();
		}
		if (BT_endo_region)
		{
			var rendition = graphicsModule.getRendition(BT_endo_region);
			rendition.beginChange();
			rendition.executeCommand('node_points glyph sphere general size "1*1*1" centre 0,0,0 select_on material gold');
			rendition.endChange();
		}
		zincPlugin.sceneViewer.viewAll();
		ShowHide('now_loading_text');
  		ShowHide('next_button');
	}			
}

function removeTextures()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var rootRegion = zincPlugin.context.getDefaultRegion();
	var i = 0;
	var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
	for (i = 0; i < textureRegions.length; i++)
	{
		var rendition = graphicsModule.getRendition(textureRegions[i]);
		rendition.beginChange();
		rendition.executeCommand('cylinders constant_radius 0.3 select_on render_shaded invisible');
		rendition.executeCommand('surfaces invisible texture xi select_on ');
		rendition.endChange();
	}
	
	textureRegions = new Array();
}

function drawPoint()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var downloadManager = zincPlugin.createDownloadManager();
	removeTextures();
	var BackTransformedUPFFinalRotated_EndoItem = downloadManager.addURI(filename1);
	var BackTransformedUPFFinalRotated_EpiItem = downloadManager.addURI(filename2);
	downloadManager.addCompletionCallback(
		getDownloadsPointReadyFunction(zincPlugin, BackTransformedUPFFinalRotated_EndoItem,BackTransformedUPFFinalRotated_EpiItem));
}

function callCardiofitService()
{
	
  	var values = new Array();
  	var proxy = "http://130.216.208.77";
	$.ajax
	({
		type: "POST",
		url: "http://130.216.208.77/cardiofitter/default/fitting",
		data: { 'mesh.name': "patient_1", 
	        'epi.ds': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph11_epi_DS.vtp",
            'epi.ed': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph07_epi_ES.vtp",
            'epi.es': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph19_epi_ED.vtp",
            'endo.ds': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph11_endo_DS.vtp",
            'endo.ed': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph07_endo_ES.vtp",
            'endo.es': "http://130.216.208.77:8380/pmr/w/tommy/sc-n-02/rawfile/2ca1558b76ec38e56cdd6a1d661447e0590f5e06/ph19_endo_ED.vtp" },
		dataType: "json",
		success: function(data) 
		{
			var fileroot = data['fileroot'];
			var files = data['files'];
			filename1 = proxy + fileroot + "/DS/"+ files['DS'][0];
			filename2 = proxy + fileroot + "/DS/"+ files['DS'][1];
			filename3 = proxy + fileroot + "/DS/"+ files['DS'][2];
			filename4 = proxy + fileroot + "/DS/"+ files['DS'][3];
			filename5 = proxy + fileroot + "/DS/"+ files['DS'][4];
			filename6 = proxy + fileroot + "/DS/"+ files['DS'][5];
			drawPoint();
		},
		error: function(x,y,z)
		{
			alert("error" + "ready state: " + x.readyState + x.statusText);
		}
	
	});
}

function triggerDrawPointService()
{
	callCardiofitService();
}

function getDownloadsUnfittedModelReadyFunction(zincPluginIn, LVEndoElementItemIn, LVEndoNodeItemIn)
{
	var zincPlugin = zincPluginIn;
	var LVEndoElementItem = LVEndoElementItemIn;
	var LVEndoNodeItem = LVEndoNodeItemIn;

	return function()
	{
		var rootRegion = zincPlugin.context.getDefaultRegion();

		var LV_region = rootRegion.createChild("LV");
		var LVstreamInformation = LV_region.createStreamInformation();
		LVstreamInformation.createResourceDownloadItem(LVEndoElementItem);
		LVstreamInformation.createResourceDownloadItem(LVEndoNodeItem);
		LV_region.read(LVstreamInformation);

		var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
		if (LV_region)
		{
			var rendition = graphicsModule.getRendition(LV_region);
			rendition.beginChange();
			rendition.executeCommand('general clear circle_discretization 48 default_coordinate coordinates element_discretization "12*12*12" native_discretization none');
			rendition.executeCommand('node_points glyph sphere general size "2*2*2" centre 0,0,0 select_on material default');
			rendition.executeCommand('cylinders constant_radius 0.2 material default');
			rendition.executeCommand('surfaces select_on material muscle');
			rendition.endChange();
		}
	}			
}

function drawUnfittedModel()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var downloadManager = zincPlugin.createDownloadManager();
	var LVCanineModel_Transformed_EndoTransElementItem = downloadManager.addURI(filename5);
	var LVCanineModel_Transformed_EndoTransNodeItem = downloadManager.addURI(filename6);
	downloadManager.addCompletionCallback(
		getDownloadsUnfittedModelReadyFunction(zincPlugin,
		LVCanineModel_Transformed_EndoTransElementItem,	LVCanineModel_Transformed_EndoTransNodeItem));	
}

function getDownloadsFittedModelReadyFunction(zincPluginIn, fittedElementItemIn, fittedNodeItemIn)
{
	var zincPlugin = zincPluginIn;
	var fittedElementItem = fittedElementItemIn;
	var fittedNodeItem = fittedNodeItemIn;

	return function()
	{
		var rootRegion = zincPlugin.context.getDefaultRegion();
		var fitted_region = rootRegion.createChild("fitted");
		var fittedstreamInformation = fitted_region.createStreamInformation();
		fittedstreamInformation.createResourceDownloadItem(fittedElementItem);
		fittedstreamInformation.createResourceDownloadItem(fittedNodeItem);
		fitted_region.read(fittedstreamInformation);
		var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
		if (fitted_region)
		{
			var rendition = graphicsModule.getRendition(fitted_region);
			rendition.beginChange();
			rendition.executeCommand('general clear circle_discretization 48 default_coordinate coordinates element_discretization "12*12*12" native_discretization none');
			rendition.executeCommand('node_points glyph sphere general size "2*2*2" centre 0,0,0 select_on material default');
			rendition.executeCommand('cylinders constant_radius 0.2 material green');
			rendition.executeCommand('surfaces select_on material green');
			rendition.endChange();
		}
	}			
}

function removeUnfittedModel()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var rootRegion = zincPlugin.context.getDefaultRegion();
	var LV_region = rootRegion.findSubregionAtPath("LV");
	var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
	if (LV_region)
	{
		var rendition = graphicsModule.getRendition(LV_region);
		rendition.removeAllGraphics();
	}
}

function drawFittedModel()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var downloadManager = zincPlugin.createDownloadManager();
	removeUnfittedModel();
	var fitted_epi_humanLVElementItem = downloadManager.addURI(filename3);
	var fitted_epi_humanLVNodeItem = downloadManager.addURI(filename4);
	downloadManager.addCompletionCallback(
		getDownloadsFittedModelReadyFunction(zincPlugin, fitted_epi_humanLVElementItem, fitted_epi_humanLVNodeItem));
}

function visualiseProteinConcentration(zincPlugin, region)
{
	var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
	var rendition = graphicsModule.getRendition(region);
	rendition.executeCommand('node_points glyph sphere general size "3*3*3" centre 0,0,0 select_on material default data concentration spectrum default');
	var spectrum = graphicsModule.findSpectrumByName("default");
	spectrum.executeCommand("autorange");
}

function createAndDrawProteinConcentration(dataArray)
{
	var zincPlugin = document.getElementById('zincplugin1');
	var rootRegion = zincPlugin.context.getDefaultRegion();
	var region = rootRegion.createChild("Protein_level");
	var fieldModule = region.getFieldModule();
	
	fieldModule.beginChange();
	
	var coordinatesField = fieldModule.createFiniteElement(3);
	coordinatesField.setName("coordinates");
	coordinatesField.setAttributeInteger(coordinatesField.ATTRIBUTE.IS_COORDINATE, 1);
	coordinatesField.setAttributeInteger(coordinatesField.ATTRIBUTE.IS_MANAGED, 1);
	var concentrationField = fieldModule.createFiniteElement(1);
	concentrationField.setName("concentration");
	concentrationField.setAttributeInteger(coordinatesField.ATTRIBUTE.IS_COORDINATE, 0);
	concentrationField.setAttributeInteger(coordinatesField.ATTRIBUTE.IS_MANAGED, 1);
	var nodeset = fieldModule.findNodesetByName("cmiss_nodes");
	var nodeTemplate1 = nodeset.createNodeTemplate();
	nodeTemplate1.defineField(coordinatesField);
	nodeTemplate1.defineField(concentrationField);
	var node_coordinates = [ 0, 0, 0 ];
	var concentrationValue = new Array();
	var fieldCache = fieldModule.createCache();
	var i = 0;
	var node;
	var size = dataArray.length;
	for (i=0; i<size; i++)
	{
		node_coordinates[0] = dataArray[i][0];
		node_coordinates[1] = dataArray[i][1];
		node_coordinates[2] = dataArray[i][2];
		concentrationValue[0] = dataArray[i][3];
		node = nodeset.createNode(i+1, nodeTemplate1);
		fieldCache.setNode(node);
		coordinatesField.assignReal(fieldCache, /*number_of_values*/3, node_coordinates);
		concentrationField.assignReal(fieldCache, /*number_of_values*/1, concentrationValue);
		node = null;
	}
	visualiseProteinConcentration(zincPlugin, region);
}

function getFromWebServiceJSONToArray(identifier)
{
  	var values = new Array();
  	ShowHide('now_loading_text');
	$.ajax({
	type: "GET",
	url: "http://lxbisel.macs.hw.ac.uk:8080/ricordo/getProteinDistribution/"+proteinNames[identifier],
	dataType: "json",
	success: function(data) 
	{
    	$.each(data[proteinNames[identifier]], function(key, val) 
    	{
			values.push([parseFloat(val['x']), parseFloat(val['y']),parseFloat(val['z']),parseFloat(val['value'])]);
    	});
    	ShowHide('now_loading_text');
    	createAndDrawProteinConcentration(values);
	},
	error: function(x,y,z)
	{
		alert("error" + "ready state: " + x.readyState + x.statusText);
	}
});
}

function removeDataPoint()
{
	var zincPlugin = document.getElementById('zincplugin1');
	var rootRegion = zincPlugin.context.getDefaultRegion();
	var BT_epi_region = rootRegion.findSubregionAtPath("BT_epi");
	var BT_endo_region = rootRegion.findSubregionAtPath("BT_endo");
	var graphicsModule = zincPlugin.context.getDefaultGraphicsModule();
	if (BT_epi_region)
	{
		var rendition = graphicsModule.getRendition(BT_epi_region);
		rendition.removeAllGraphics();
	}
	if (BT_endo_region)
	{
		var rendition = graphicsModule.getRendition(BT_endo_region);
		rendition.removeAllGraphics();
	}
}

function displayConcentration()
{
	removeDataPoint();
	var selector = document.getElementById('proteinSelector');
	if (selector.value != 1 && selector.value <=4)
  	{
  		getFromWebServiceJSONToArray(selector.value - 1);
  	}
}

/* This function is called when the primary scene is constructed and read */
function sceneViewerReadyFunction()
{
	var zincPlugin = document.getElementById('zincplugin1');
	zincPlugin.sceneViewer.setBackgroundColourRGB(1.0, 1.0, 1.0);
	ZN_OK = zincPlugin.OK;
	zincPlugin.context.getDefaultGraphicsModule().defineStandardMaterials();
}

function CallCardiacFitting_callBack(r, soapResponse)
{
	if(r.length + "" == "undefined")
	{
		alert("Error: " + r.message + "\n" + r.fileName);
	}
	else
	{
		triggerDrawPointService();
	}
}

function CallCardiacFitting()
{
	var parameters = new SOAPClientParameters();
	parameters.add("inputMesh", "/home/ubuntu/webservice-data/init-javascript.vtk");
	parameters.add("inputImage", "/home/ubuntu/SC-HF-I-01-VTK/ST07.vtk");
	parameters.add("outputMesh", "/home/ubuntu/webservice-data/fitted-javascript.vtk");
	parameters.add("outputMeshEpi", "/home/ubuntu/webservice-data/fitted-javascript-epi.vtk");
	parameters.add("outputMeshEndo", "/home/ubuntu/webservice-data/fitted-javascript-endo.vtk");
	SOAPClient.invoke(wsGimiasURL, "Cardiac_Fitting", parameters, true, CallCardiacFitting_callBack);
}

function CallCardiacInitialization_callBack(r, soapResponse)
{
	if(r.length + "" != "undefined")
	{
		CallCardiacFitting();
	}
	else
	{
		alert("Error");
	}
}

function CallCardiacInitialization()
{
  	ShowHide('now_loading_text');
  	ShowHide('next_button');
	var parameters = new SOAPClientParameters();
	var selector = document.getElementById('mySelect');
	parameters.add("cardiacModel", cardiacModelNames[selector.value - 1]);
	parameters.add("landmarks", document.getElementById('initialization_landmarks').value);
	parameters.add("outputMeshName", "/home/ubuntu/webservice-data/init-javascript.vtk");
	SOAPClient.invoke(wsGimiasURL, "Cardiac_Initialization", parameters, true, CallCardiacInitialization_callBack);
}

function next()
{
	if (stage == 0)
	{
		drawTexture();
		ShowHide('patient_text');
		ShowHide('radio');
		ShowHide('select_patient_text');
		ShowHide('select_segmentation_text');
		ShowHide('initialization_landmarks_textbox');
		ShowHide('mySelect');
	}
	if (stage == 1)
	{
		ShowHide('select_segmentation_text');
		ShowHide('initialization_landmarks_textbox');
		ShowHide('mySelect');
		CallCardiacInitialization();
	}
	if (stage == 2)
	{
		drawUnfittedModel();
		ShowHide('next_to_fit_mesh_text');
	}
	if (stage == 3)
	{
		drawFittedModel();
		ShowHide('next_to_fit_mesh_text');
		ShowHide('proteinSelector_panel');
		ShowHide('click_next_to_see_density_text');
	}
	if (stage == 4)
	{
		displayConcentration();
		ShowHide('proteinSelector_panel');
		ShowHide('click_next_to_see_density_text');
		ShowHide('next_button');
	}
	stage++;
}
