'use strict';

/* Controllers */

function valueFn (value) {
    return function () {
        return value;
    };
}

function mkUpdateOrderBy($scope) {
    return function (column) {
        var rev = column == $scope.orderProp;
        $scope.sortCls = {};
        $scope.sortCls[column] = 'sort-' + (rev ? 'desc' : 'asc');
        if (rev) {
            column = '-' + column;
        }
        $scope.orderProp = column;
    };
}

function mkAllSelected($scope, key) {
    return function () {
        var collection = $scope[key];
        if (collection.length == 0) {
            return false;
        }
        return collection.every(function (item) {
            return item.selected;
        });
    };
}

function mkNothingSelected($scope, key) {
    return function () {
        var collection = $scope[key];
        return !collection.some(function (item) {
            return item.selected;
        });
    };
}

function mkToggleAll($scope, key, allSelected) {
    return function () {
        var collection = $scope[key];
        var newValue = !allSelected();
        collection.forEach(function (item) {
            item.selected = newValue;
        });
    };
}

angular.module('swiftBrowser.controllers',
               ['swiftBrowser.swift', 'ui.bootstrap', 'ui.codemirror'])
    .controller('RootCtrl', function ($scope, $swift, $modal) {
            $scope.containers = [];
            $scope.updateOrderBy = mkUpdateOrderBy($scope);
            $scope.updateOrderBy('name');

            $scope.allSelected = mkAllSelected($scope, 'containers');
            $scope.toggleAll = mkToggleAll($scope, 'containers',
                                           $scope.allSelected);
            $scope.nothingSelected = mkNothingSelected($scope, 'containers');

            $scope.create = function () {
                var opts = {
                    templateUrl: 'partials/create-container-modal.html'
                };
                var inst = $modal.open(opts);
                inst.result.then(function (name) {
                    $swift.createContainer(name).then(function () {
                        var container = {name: name, count: 0, bytes: 0};
                        $scope.containers.push(container);
                    });
                });
            };

            $scope.delete = function () {
                var scope = $scope.$new(true);
                scope.containers = [];
                $scope.containers.forEach(function (container, idx) {
                    if (container.selected) {
                        var copy = angular.copy(container);
                        copy.idx = idx;
                        scope.containers.push(copy);
                    }
                });
                scope.updateOrderBy = mkUpdateOrderBy(scope);
                scope.updateOrderBy('name');
                scope.allSelected = mkAllSelected(scope, 'containers');
                scope.toggleAll = mkToggleAll(scope, 'containers',
                                              scope.allSelected);
                scope.nothingSelected = mkNothingSelected(scope, 'containers');

                var opt = {templateUrl: 'partials/delete-container-modal.html',
                           scope: scope};
                var inst = $modal.open(opt);
                inst.result.then(function () {
                    scope.containers.forEach(function (container) {
                        if (container.selected) {
                            var req = $swift.deleteContainer(container.name);
                            req.then(function () {
                                delete $scope.containers[container.idx];
                            });
                        }
                    });
                });
            };

            $swift.listContainers().then(function (result) {
                $scope.containers = result.data;
            });
        })
    .controller('ContainerCtrl', function ($scope, $swift, $stateParams, $location, $modal) {
            var container = $stateParams.container;
            var prefix = $stateParams.prefix || '';
            $scope.container = container;
            $scope.updateOrderBy = mkUpdateOrderBy($scope);
            $scope.updateOrderBy('name');

            $scope.items = [];
            $scope.allSelected = mkAllSelected($scope, 'items');
            $scope.toggleAll = mkToggleAll($scope, 'items', $scope.allSelected);
            $scope.nothingSelected = mkNothingSelected($scope, 'items');

            $scope.delete = function () {
                var scope = $scope.$new(true);
                scope.items = [];
                $scope.items.forEach(function (item, idx) {
                    if (item.selected) {
                        var copy = angular.copy(item);
                        copy.idx = idx;
                        scope.items.push(copy);
                    }
                });
                scope.updateOrderBy = mkUpdateOrderBy(scope);
                scope.updateOrderBy('name');
                scope.allSelected = mkAllSelected(scope, 'items');
                scope.toggleAll = mkToggleAll(scope, 'items',
                                              scope.allSelected);
                scope.nothingSelected = mkNothingSelected(scope, 'items');

                var opt = {templateUrl: 'partials/delete-modal.html',
                           scope: scope};
                var inst = $modal.open(opt);
                inst.result.then(function () {
                    scope.items.forEach(function (item) {
                        if (item.selected) {
                            var req;
                            if (item.subdir) {
                                req = $swift.deleteDirectory(container,
                                                             item.name);
                            } else {
                                req = $swift.deleteObject(container,
                                                          item.name);
                            }
                            req.then(function () {
                                delete $scope.items[item.idx];
                            });
                        }
                    });
                });
            };

            $scope.upload = function () {
                var scope = $scope.$new(true);
                scope.files = [];
                scope.path = container + '/' + prefix;
                scope.fileSelected = function (elm) {
                    // Since fileSelected is called from a non-Angular
                    // event handler, we need to inform the scope
                    // about the update. Otherwise the update won't be
                    // noticed until the next digest cycle.
                    scope.$apply(function () {
                        for (var j = 0; j < elm.files.length; j++) {
                            var file = elm.files[j];
                            file.uploadPct = null;
                            scope.files.push(file);
                        }
                    });
                };
                scope.remove = function (idx) {
                    scope.files.splice(idx, 1);
                };

                var opt = {templateUrl: 'partials/upload-modal.html',
                           scope: scope};
                $modal.open(opt);

                scope.uploadFiles = function () {
                    scope.files.forEach(function (file) {
                        if (file.uploadPct == 100) {
                            return;
                        }
                        var name = prefix + file.name;
                        var item = {name: name,
                                    title: file.name,
                                    bytes: file.size};
                        file.uploadPct = 0;
                        var headers = {'content-type': file.type};
                        var upload = $swift.uploadObject(container, name,
                                                         file, headers);
                        upload.progress(function (evt) {
                            if (evt.lengthComputable) {
                                var frac = evt.loaded / evt.total;
                                file.uploadPct = parseInt(100.0 * frac);
                            }
                        });
                        upload.success(function () {
                            $scope.items.push(item);
                            file.uploadPct = 100;
                        });
                    });
                };

                scope.disableUpload = function () {
                    return scope.files.every(function (file) {
                        return file.uploadPct != null;
                    });
                };
            };

            $scope.copy = function () {
                var opt = {
                    templateUrl: 'partials/copy-modal.html',
                    controller: 'CopyModalCtrl',
                    resolve: {
                        container: valueFn(container),
                        prefix: valueFn(prefix),
                        items: valueFn($scope.items.filter(function (item) {
                            return item.selected;
                        }))
                    }
                };
                $modal.open(opt);
            };

            $scope.breadcrumbs = [{name: '', title: 'Root'}];

            var prefixes = prefix.split('/');
            prefixes.unshift(container);
            for (var i = 0; i < prefixes.length - 1; i++) {
                var crumb = {name: prefixes.slice(0, i + 1).join('/') + '/',
                             title: prefixes[i]};
                $scope.breadcrumbs.push(crumb);
            }

            var params = {prefix: prefix, delimiter: '/'};
            $swift.listObjects(container, params).then(function (result) {
                $scope.items = result.data.map(function (item) {
                    var parts = (item.subdir || item.name).split('/');

                    if (item.subdir) {
                        return {name: item.subdir,
                                title: parts[parts.length - 2] + '/',
                                bytes: '\u2014', // em dash
                                subdir: true};
                    } else {
                        item.title = parts[parts.length - 1];
                        return item;
                    }
                });
            });
        })
    .controller('ObjectCtrl', function ($scope, $stateParams, $swift, $location, $modal) {
            var container = $stateParams.container;
            var name = $stateParams.name;

            $scope.breadcrumbs = [{name: '', title: 'Root'}];
            var parts = name.split('/');
            parts.unshift(container);
            for (var i = 0; i < parts.length; i++) {
                var crumb = {name: parts.slice(0, i + 1).join('/') + '/',
                             title: parts[i]};
                $scope.breadcrumbs.push(crumb);
            }

            function flatten(headers) {
                var flattened = {};
                headers.sys.forEach(function (header) {
                    if (header.editable) {
                        flattened[header.name] = header.value;
                    }
                });
                headers.meta.forEach(function (header) {
                    if (header.name) {
                        flattened[header.name] = header.value;
                    }
                });
                return flattened;
            }

            var params = {prefix: name, delimiter: '/'};
            $swift.listObjects(container, params).then(function (result) {
                var redirect = result.data.some(function (item) {
                    if (item.subdir == name + '/') {
                        // Add trailing slash for pseudo-directory
                        $location.path($location.path() + '/');
                        return true;
                    }
                });
                if (redirect) {
                    return;
                }

                var headers = {meta: [], sys: []};
                $scope.container = container;
                $scope.name = name;
                $scope.reset = function () {
                    $scope.headers = angular.copy(headers);
                };
                $scope.save = function () {
                    var flattened = flatten($scope.headers);
                    var req = $swift.postObject(container, name, flattened);
                    req.then(function () {
                        $scope.headers.meta.forEach(function (header) {
                            header.added = false;
                        });
                        $scope.headers.sys.forEach(function (header) {
                            header.added = false;
                        });
                        headers = angular.copy($scope.headers);
                        $scope.form.$setPristine();
                    });
                };
                $scope.remove = function (type, idx) {
                    $scope.headers[type].splice(idx, 1);
                    $scope.form.$setDirty();
                };
                $scope.add = function (type) {
                    if (type == 'meta') {
                        $scope.headers.meta.push({name: 'x-object-meta-',
                                                  value: '',
                                                  added: true});
                    } else {
                        // Use first removable header as default value
                        $scope.headers.sys.push({
                            name: $scope.removableHeaders[0],
                            value: '',
                            added: true,
                            editable: true,
                            removable: true
                        });
                    }
                };

                $scope.edit = function () {
                    var opts = {templateUrl: 'partials/edit-modal.html',
                                controller: 'EditModalCtrl',
                                resolve: {
                                    container: valueFn(container),
                                    name: valueFn(name),
                                    headers: valueFn(flatten($scope.headers))
                                },
                                size: 'lg'};
                    $modal.open(opts);
                };

                $swift.headObject(container, name).then(function (result) {
                    var allHeaders = result.headers();
                    var editableHeaders = [
                        'content-type',
                        'content-encoding',
                        'content-disposition',
                        'x-delete-at'
                    ];
                    $scope.removableHeaders = [
                        'content-encoding',
                        'content-disposition',
                        'x-delete-at'
                    ];
                    var sysHeaders = [
                        'last-modified',
                        'content-length',
                        'content-type',
                        'etag',
                        'content-encoding',
                        'content-disposition',
                        'x-delete-at',
                        'x-object-manifest',
                        'x-static-large-object'
                    ];
                    angular.forEach(allHeaders, function (value, name) {
                        var header = {name: name, value: value};
                        if (name.indexOf('x-object-meta-') == 0) {
                            headers.meta.push(header);
                        } else if (sysHeaders.indexOf(name) > -1) {
                            if (editableHeaders.indexOf(name) > -1) {
                                header.editable = true;
                            }
                            if ($scope.removableHeaders.indexOf(name) > -1) {
                                header.removable = true;
                            }
                            headers.sys.push(header);
                        }
                        headers.meta.sort();
                        headers.sys.sort();
                        $scope.reset();
                    });
                });
            });
        })
    .controller('EditModalCtrl', function ($swift, $q, $timeout, $scope, $modalInstance,
                  container, name, headers) {
            // To prevent a blank editor showing, we need to
            // refresh it after opening the modal. We will
            // capture the editor here and refresh it below.
            var pendingEditor = $q.defer();
            $scope.name = name;
            $scope.editor = {
                content: '',
                options: {
                    onLoad: pendingEditor.resolve,
                    lineNumbers: true
                }
            };
            $scope.save = function () {
                var upload = $swift.uploadObject(
                    container, name, $scope.editor.content, headers
                );
                upload.then(function () {
                    $scope.form.$setPristine();
                });
            };
            var req = $swift.getObject(container, name);
            req.then(function (result) {
                $scope.editor.content = result.data;
            });

            $modalInstance.opened.then(function () {
                pendingEditor.promise.then(function (editor) {
                    $timeout(function () {
                        var CodeMirror = window.CodeMirror;
                        var mime = headers['content-type'];
                        var info = CodeMirror.findModeByMIME(mime);
                        if (info) {
                            CodeMirror.autoLoadMode(editor, info.mode);
                            editor.setOption('mode', info.mode);
                        }
                        editor.refresh();
                    });
                });
            });
        })
    .controller('CopyModalCtrl', function ($swift, $scope, $modalInstance, container, prefix, items) {
            $scope.items = angular.copy(items);
            $scope.updateOrderBy = mkUpdateOrderBy($scope);
            $scope.updateOrderBy('name');
            $scope.disableCopy = function () {
                return $scope.items.every(function (item) {
                    return item.copied;
                });
            };

            $scope.destContainer = container;
            $swift.listContainers().then(function (result) {
                $scope.containers = result.data;
            });
            $scope.directory = prefix;
            $scope.copyObjects = function () {
                $scope.items.forEach(function (item) {
                    function nonEmpty (part) {
                        return part.length > 0;
                    }
                    var destDir = $scope.directory;
                    // Remove leading, trailing, and double slashes
                    destDir = destDir.split('/').filter(nonEmpty).join('/');
                    var destName = destDir + '/' + item.title;
                    var req = $swift.copyObject(
                        container, item.name, $scope.destContainer, destName
                    );
                    req.then(function () {
                        item.copied = true;
                    }, function () {
                        item.copied = false;
                    });
                });
            };
        });
