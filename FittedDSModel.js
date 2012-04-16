/* Hardcode file names or URL below */
filename1 = "BackTransformedUPFFinalRotated_Endo.exdata";
filename2 = "BackTransformedUPFFinalRotated_Epi.exdata";
filename3 = "fitted_epi_humanLV.exelem";
filename4 = "fitted_epi_humanLV.exnode";
filename5 = "LVCanineModel_Transformed_EndoTrans.exelem";
filename6 = "LVCanineModel_Transformed_EndoTrans.exnode";

/* Use a wrapper to preserve the arguments until the callback is made,
	most of the function calls here are similar to the getDownloadsHeartReadyFunction*/
function getDownloadsDSModelReadyFunction(zincPluginIn, BTEndoItemIn, BTEpiItemIn, fittedElementItemIn, fittedNodeItemIn,
	LVEndoElementItemIn, LVEndoNodeItemIn)
{
	var zincPlugin = zincPluginIn;
	var BTEndoItem = BTEndoItemIn;
	var BTEpiItem = BTEpiItemIn;
	var fittedElementItem = fittedElementItemIn;
	var fittedNodeItem = fittedNodeItemIn;
	var LVEndoElementItem = LVEndoElementItemIn;
	var LVEndoNodeItem = LVEndoNodeItemIn;

	return function()
	{
		var rootRegion = zincPlugin.context.getDefaultRegion();
		var BT_epi_region = rootRegion.createChild("BT_epi");
		var BT_endo_region = rootRegion.createChild("BT_endo");
		var fitted_region = rootRegion.createChild("fitted");
		var LV_region = rootRegion.createChild("LV");
		var LVstreamInformation = LV_region.createStreamInformation();
		LVstreamInformation.createResourceDownloadItem(LVEndoElementItem);
		LVstreamInformation.createResourceDownloadItem(LVEndoNodeItem);
		LV_region.read(LVstreamInformation);
		var fittedstreamInformation = fitted_region.createStreamInformation();
		fittedstreamInformation.createResourceDownloadItem(fittedElementItem);
		fittedstreamInformation.createResourceDownloadItem(fittedNodeItem);
		fitted_region.read(fittedstreamInformation);
		var BTepistreamInformation = BT_epi_region.createStreamInformation();
		BTepistreamInformation.createResourceDownloadItem(BTEpiItem);
		BT_epi_region.read(BTepistreamInformation);
		var BTendostreamInformation = BT_endo_region.createStreamInformation();
		BTendostreamInformation.createResourceDownloadItem(BTEndoItem);
		BT_endo_region.read(BTendostreamInformation
		);

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
		if (BT_epi_region)
		{
			var rendition = graphicsModule.getRendition(BT_epi_region);
			rendition.beginChange();
			rendition.executeCommand('node_points glyph sphere general size "1*1*1" centre 0,0,0 select_on material green');
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
	}			
}

/* This function is called when the primary scene is constructed and read */
function sceneViewerReadyFunction()
{
	var zincPlugin = document.getElementById('zincplugin1');
	ZN_OK = zincPlugin.OK;-
	zincPlugin.context.getDefaultGraphicsModule().defineStandardMaterials();
	/* create another manager for reading in more files */
	var downloadManager = zincPlugin.createDownloadManager();
	var BackTransformedUPFFinalRotated_EndoItem = downloadManager.addURI(filename1);
	var BackTransformedUPFFinalRotated_EpiItem = downloadManager.addURI(filename2);
	var fitted_epi_humanLVElementItem = downloadManager.addURI(filename3);
	var fitted_epi_humanLVNodeItem = downloadManager.addURI(filename4);
	var LVCanineModel_Transformed_EndoTransElementItem = downloadManager.addURI(filename5);
	var LVCanineModel_Transformed_EndoTransNodeItem = downloadManager.addURI(filename6);
	downloadManager.addCompletionCallback(
		getDownloadsDSModelReadyFunction(zincPlugin, BackTransformedUPFFinalRotated_EndoItem,BackTransformedUPFFinalRotated_EpiItem,
		fitted_epi_humanLVElementItem, fitted_epi_humanLVNodeItem, LVCanineModel_Transformed_EndoTransElementItem,
		LVCanineModel_Transformed_EndoTransNodeItem));
}
