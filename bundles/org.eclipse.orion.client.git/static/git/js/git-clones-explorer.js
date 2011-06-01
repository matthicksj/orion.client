/******************************************************************************* 
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global dojo eclipse:true widgets*/

define(['dojo', 'orion/explorer', 'orion/util'], function(dojo, mExplorer, mUtil) {
var exports = {};

exports.GitClonesExplorer = (function() {
	
	function GitClonesExplorer(registry, selection, parentId, toolbarId, selectionToolsId){
		this.parentId = parentId;
		this.registry = registry;
		this.selection = selection;
		this.toolbarId = toolbarId;
		this.selectionToolsId = selectionToolsId;
		this.renderer = new exports.GitClonesRenderer({checkbox: this.checkbox}, this);
		
	}
	GitClonesExplorer.prototype = mExplorer.Explorer.prototype;
	
	GitClonesExplorer.prototype.getGitLocation = function(path){
		return "/gitapi/clone/"+ mUtil.makeRelative(path);
	};
	
	GitClonesExplorer.prototype.setDefaultPath = function(defaultPath){
		this.defaultPath = defaultPath;
	};
	
	GitClonesExplorer.prototype.displayClonesList = function(path){
		
			var self = this;
			
			path = path || this.defaultPath;
			
			path = mUtil.makeRelative(path);
			if (path === this._lastHash) {
				return;
			}
						
			this._lastHash = path;
			dojo.hash(path, true);
			
			var gitPath = this.getGitLocation(path);
			
			var d = dojo.create("div", null, dojo.byId(this.parentId), "only");
			d.innerHTML = "Loading <b>" + gitPath + "</b>...";
			
			this.registry.getService("orion.git.provider").then(function(service){
				dojo.hitch(self, self.createTree(self.parentId, new exports.GitClonesModel(service, gitPath, service.getGitClone)));
			});
		};
		
	GitClonesExplorer.prototype.redisplayClonesList = function(){

		if(!this._lastHash){
			return;
		}
		
		var self = this;	
		var gitPath = this.getGitLocation(this._lastHash);		
		var d = dojo.create("div", null, dojo.byId(this.parentId), "only");
		d.innerHTML = "Loading <b>" + gitPath + "</b>...";
		
		this.registry.getService("orion.git.provider").then(function(service){
			dojo.hitch(self, self.createTree(self.parentId, new exports.GitClonesModel(service, gitPath, service.getGitClone)));
		});
	};

	return GitClonesExplorer;
}());

exports.GitClonesModel = (function() {
	/**
	 * @name eclipse.Model
	 * @class Tree model used by eclipse.FileExplorer.
	 * TODO: Consolidate with eclipse.TreeModel.
	 */
	function GitClonesModel(gitClient, rootPath, fetchItems) {
		this.gitClient = gitClient;
		this.rootPath = rootPath;
		this.fetchItems = fetchItems;
		this.root = null;
	}
	GitClonesModel.prototype = mExplorer.ExplorerModel.prototype; 
	
	
	GitClonesModel.prototype.getRoot = function(onItem){
		this.fetchItems(this.rootPath).then(
			dojo.hitch(this, function(item){
				this.root = item;
				onItem(item);
			})
		);
	};
		
	GitClonesModel.prototype.getChildren = function(/* dojo.data.Item */ parentItem, /* function(items) */ onComplete){
			// the parent already has the children fetched
			if (parentItem.Children) {
				for(var i=0; i<parentItem.Children.length; i++){
					parentItem.Children[i].parent = parentItem;
				}
				onComplete(parentItem.Children);
			}
			else if (parentItem.BranchLocation && parentItem.RemoteLocation){
				onComplete([{GroupNode : "true", Location : parentItem.BranchLocation, Name : "Branch", parent : parentItem}, {GroupNode : "true", Location : parentItem.RemoteLocation, Name : "Remote", parent : parentItem}]);
			}
			else if (parentItem.GroupNode){
				this.gitClient.getGitBranch(parentItem.Location).then( 
					dojo.hitch(this, function(children) {
						for(var i=0; i<children.Children.length; i++){
							children.Children[i].parent = parentItem;
						}
						onComplete(children.Children);
					})
				);
			}
			else if (parentItem.Type === "Remote"){
				this.gitClient.getGitBranch(parentItem.Location).then( 
					dojo.hitch(this, function(children) {
						for(var i=0; i<children.Children.length; i++){
							children.Children[i].parent = parentItem;
						}
						onComplete(children.Children);
					})
				);
			}
		};
		
	return GitClonesModel;
}());

exports.GitClonesRenderer = (function(){
	
	function GitClonesRenderer(options, explorer){
		this._init(options);
		this.explorer = explorer;
	}
	GitClonesRenderer.prototype = mExplorer.SelectionRenderer.prototype;
	
	GitClonesRenderer.prototype.getCellHeaderElement = function(col_no){
		
		switch(col_no){
		case 0: 
			return dojo.create("th", {innerHTML: "<h2>Name</h2>"});
			break;
		case 1:
			return dojo.create("th", {innerHTML: "<h2>Actions</h2>"});
			break;
		};
		
	};
	
	GitClonesRenderer.prototype.getCellElement = function(col_no, item, tableRow){
		
		switch(col_no){
		case 0:
			var col, div, link;
			if (item.BranchLocation && item.RemoteLocation) {
				col = document.createElement('td');
				var nameId =  tableRow.id + "__expand";
				div = dojo.create("div", null, col, "only");
				// defined in ExplorerRenderer.  Sets up the expand/collapse behavior
				this.getExpandImage(tableRow, div, "/git/images/git-repository.gif");
				
				link = dojo.create("a", {innerHTML: item.Name, className: "navlinkonpage", href: "/navigate/table.html#" + item.ContentLocation+"?depth=1"}, div, "last");
				dojo.place(document.createTextNode(item.Name), link, "only");
			} else if (item.GroupNode){
				col = document.createElement('td');
				var nameId =  tableRow.id + "__expand";
				div = dojo.create("div", null, col, "only");
				// defined in ExplorerRenderer.  Sets up the expand/collapse behavior
				this.getExpandImage(tableRow, div, item.Name==="Branch" ? "/git/images/git-branches.gif" : "/git/images/git-remotes.gif");
				
				link = dojo.create("a", {innerHTML: item.Name, className: "navlinkonpage"}, div, "last");
				dojo.place(document.createTextNode(item.Name), link, "only");
			} else if (item.Type === "Branch"){
				col = document.createElement('td');
				div = dojo.create("div", {style: "margin-left: 10px"}, col, "only");
				
				link = dojo.create("a", {innerHTML: item.Name, className: "navlinkonpage"}, div, "last");
				if (item.Current)
					link.style.fontWeight = "bold";
				dojo.place(document.createTextNode(item.Name), link, "only");
				dojo.create("img", {src: "/git/images/git-branch.gif"}, link, "first");
				
			} else if (item.Type === "Remote"){
				col = document.createElement('td');
				var nameId =  tableRow.id + "__expand";
				div = dojo.create("div", null, col, "only");
				// defined in ExplorerRenderer.  Sets up the expand/collapse behavior
				this.getExpandImage(tableRow, div, "/git/images/git-remote.gif");
				
				link = dojo.create("a", {innerHTML: item.Name, className: "navlinkonpage"}, div, "last");
				dojo.place(document.createTextNode(item.Name), link, "only");
			} else if (item.Type === "RemoteTrackingBranch"){
				col = document.createElement('td');
				div = dojo.create("div", {style: "margin-left: 10px"}, col, "only");
								
				link = dojo.create("a", {innerHTML: item.Name, className: "navlinkonpage"}, div, "last");
								
				dojo.place(document.createTextNode(item.Name), link, "only");
				dojo.create("img", {src: "/git/images/git-branch.gif"}, link, "first");
			}	
			return col;
		case 1:
			return this.getActionsColumn(item, tableRow);
		};
	};

	return GitClonesRenderer;
}());
return exports;
});