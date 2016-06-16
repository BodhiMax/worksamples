/**

Sample of angular work. This is building a grid to manage a type of notification

File has been modified to remove potentially sensitive client logic, including renaming objects and properties

**/

(function (angular) {
    'use strict';

    angular
        .module('some.module')
        .controller('SomeFunctionalityDataGridCtrl', SomeFunctionalityDataGridCtrl);

    SomeFunctionalityDataGridCtrl.$inject = [
        /*
        a bunch of dependencies go here
        */
    ];

    function SomeFunctionalityDataGridCtrl(/*  and same for here */) {

        var self = this;

        assortmentPlanViewModel.currentView = 'A title string';

        var gridBuilder;// reference to GridBuilder instance
        var supportedsomefunctionalityTypes = ['wholesalePriceChange', 'retailPriceChange', 'offerDateChange', 'futuresOfferEndDateChange', 'linePlanDrop', 'addedProduct', 'droppedProduct'];

        $scope.somefunctionalitysAcknowledged = AcknowledgesomefunctionalitysService.somefunctionalityCollection;
        $scope.productsAdded = AcknowledgesomefunctionalitysService.productsAdded;
        $scope.productsDropped = AcknowledgesomefunctionalitysService.productsDropped;
        $scope.productsChanged = AcknowledgesomefunctionalitysService.productsChanged;
        $scope.somefunctionalitysCount = somefunctionalitysCount;
        $scope.togglesomefunctionalitySelection = togglesomefunctionalitySelection;
        $scope.allsomefunctionalitysSelected = allsomefunctionalitysSelected;
        $scope.selectedsomefunctionalitysCount = selectedsomefunctionalitysCount;
        $scope.somesomefunctionalitysSelected = somesomefunctionalitysSelected;
        $scope.someNotAllsomefunctionalitysSelected = someNotAllsomefunctionalitysSelected;
        $scope.togglesomefunctionalitysColumn = togglesomefunctionalitysColumn;
        $scope.hasWriteAccess = determineUserAccess();

        $scope.toolbarVM = toolbarViewModelFactory.create();
        $scope.toolbarVM.view = 'grid';

        AcknowledgesomefunctionalitysService.updateProductsChanged = updateProductsChanged;
        AcknowledgesomefunctionalitysService.collectAllsomefunctionalitys = collectAllsomefunctionalitys;
        AcknowledgesomefunctionalitysService.updateProductsAdded = updateProductsAdded;
        AcknowledgesomefunctionalitysService.updateProductsDropped = updateProductsDropped;
        AcknowledgesomefunctionalitysService.determineUserAccess = determineUserAccess;

        buildButtonHandlers();
        createGrid();

        /**
         * Pass-through method for supporting grid display
         * @param record
         * @param climateCode
         * @param flowCode
         * @returns {*}
         */
        function isDigital(record, climateCode, flowCode) {
            return record.isDigital(climateCode, flowCode);
        }

        /**
         * Builds the grid data and inits it
         */
        function createGrid() {

            gridBuilder = GridBuilderFactory.create({
                gridName: 'SOMETHING_somefunctionalityS_GRID',
                records: gridModel.records,
                defineGridTemplates: SalessomefunctionalitysGridDefinitionService.defineGridTemplates,
                defineColumnGroups: SalessomefunctionalitysGridDefinitionService.defineColumnGroups,
                defineGridColumns: SalessomefunctionalitysGridDefinitionService.defineGridColumns,
                gridRegistrationCallback: function (definitions, gridBuilder) {
                    buildPlanDates(definitions, gridBuilder);
                },
                initializationCallback: function () {
                    self.grid = gridBuilder.grid;
                    updatesomefunctionalityColumns();
                }
            });

        }

        function updatesomefunctionalityColumns() {

            _.each(supportedsomefunctionalityTypes, function (somefunctionalityType) {
                var cols = self.grid.model.columnDefinitions;
                if (somefunctionalitysCount(somefunctionalityType) === 0) {
                    for (var i = 0; i < cols.length; i++) {
                        if (cols[i].id === gridBuilder.getTemplateName(somefunctionalityType)) {
                            cols.splice(i, 1);
                            break;
                        }
                    }
                }
            });

        }

        function determineUserAccess() {

            return AssortmentPlanResolverService.checkUserWriteAccessOnly(assortmentPlanViewModel.model.assortmentPlan);
        }

        /**
         * Action menu button handler.
         * Shows the column customization modal.
         */
        function showDisplayAttributesModal() {
            self.displayGridColumnsModal = true;
        }

        function somefunctionalitysCount(somefunctionalityType) {

            if (somefunctionalityType) {
                return self.grid.model.records
                    .filter(function (record) {
                        return !!record[somefunctionalityType];
                    }).length;
            }

            var count = 0;
            self.grid.model.records.forEach(function (record) {
                supportedsomefunctionalityTypes.forEach(function (somefunctionalityType) {
                    if (record[somefunctionalityType]) {
                        count++;
                    }
                });
            });
            return count;
        }

        function allsomefunctionalitysSelected(somefunctionalityType) {
            return selectedsomefunctionalitysCount(somefunctionalityType) === somefunctionalitysCount(somefunctionalityType);
        }

        function buildButtonHandlers() {
            self.displayGridColumnsModal = false;

            assortmentPlanViewModel.toolbarVM.buttonsMenu.define('displayAttributesModal', {
                title: 'Display Attributes',
                classes: 'some-class-goes-here'
            });
            assortmentPlanViewModel.toolbarVM.buttonsMenu.on('displayAttributesModal', function () {
                self.displayGridColumnsModal = true;
            });
        }

        function buildPlanDates(definitions, gridBuilder) {

            var columnId = gridBuilder.getTemplateName('planDates'),
                columns = definitions;

            for (var i = 0; i < columns.length; i++) {

                if (columns[i].id === columnId) {

                    var width = 0;

                    _.forEach(assortmentPlanViewModel.model.assortmentPlan.planningDates, function (planningDate, index) {

                        columns[i].subColumns.push({
                            width: columns[i].subColumnWidth,
                            label: moment.utc(planningDate.planDate).format(UIStringsService.UIString('crdHeaderFormat'))
                        });

                        width += columns[i].subColumns[index].width;

                    });

                    columns[i].width = width;
                    break;
                }

            }

        }

        function collectAllsomefunctionalitys() {

            var allsomefunctionalitys = [];
            _.each(assortmentPlanViewModel.somefunctionalitys, function (somefunctionality) {

                var idAcknowledged = somefunctionality.id;
                var lastModifiedDate = somefunctionality.lastModDate;
                var acknowledgedsomefunctionality = {
                    id: idAcknowledged,
                    lastModDate: lastModifiedDate
                };
                allsomefunctionalitys.push(acknowledgedsomefunctionality);
            });
            return allsomefunctionalitys;
        }

        function selectedsomefunctionalitysCount(somefunctionalityType) {

            if (somefunctionalityType) {
                return self.grid.model.records
                    .filter(function (record) {
                        return record[somefunctionalityType] && record[somefunctionalityType].checked;
                    }).length;
            }

            var count = 0;
            self.grid.model.records.forEach(function (record) {
                supportedsomefunctionalityTypes.forEach(function (somefunctionalityType) {
                    if (record[somefunctionalityType] && record[somefunctionalityType].checked) {
                        count++;
                    }
                });
            });
            return count;
        }

        function somesomefunctionalitysSelected(somefunctionalityType) {
            return $scope.selectedsomefunctionalitysCount(somefunctionalityType) > 0;
        }

        function someNotAllsomefunctionalitysSelected(somefunctionalityType) {
            var selectedsomefunctionalitysCount = $scope.selectedsomefunctionalitysCount(somefunctionalityType);
            return selectedsomefunctionalitysCount > 0 && selectedsomefunctionalitysCount < somefunctionalitysCount(somefunctionalityType);
        }

        function togglesomefunctionalitysColumn(somefunctionalityType, column, $event) {

            $event.stopPropagation();
            $event.preventDefault();

            var offeringsWithsomefunctionalityType = self.grid.model.records
                .filter(function (record) {
                    return record.hasOwnProperty(somefunctionalityType);
                });
            column.checked = !offeringsWithsomefunctionalityType
                .every(function (record) {
                    return record[somefunctionalityType].checked;
                });
            offeringsWithsomefunctionalityType
                .forEach(function (record) {
                    togglesomefunctionalitySelection(somefunctionalityType, record, column, $event)
                });
        }

        function togglesomefunctionalitySelection(somefunctionalityType, record, column, $event) {

            $event.stopPropagation();
            $event.preventDefault();

            record[somefunctionalityType].checked = !record[somefunctionalityType].checked;

            var isChecked = record[somefunctionalityType].checked;
            var idAcknowledged = record[somefunctionalityType].id;

            var offeringsWithsomefunctionalityType = self.grid.model.records
                .filter(function (record) {
                    return record.hasOwnProperty(somefunctionalityType);
                });
            column.checked = offeringsWithsomefunctionalityType
                .every(function (record) {
                    return record[somefunctionalityType].checked;
                });

            if (record[somefunctionalityType].details === 'nonCpssomefunctionality') {

                if (somefunctionalityType === 'addedProduct') {
                    var addedProductIndex = _.indexOf($scope.productsAdded, _.find($scope.productsAdded, function (obj) {
                        return obj.id === idAcknowledged;
                    }));

                    if (isChecked && addedProductIndex === -1) {
                        $scope.productsAdded.push({
                            id: record.moId + '-' + record.poId,
                            moId: record.moId,
                            poId: record.poId
                        });
                    }
                    else if (!isChecked && addedProductIndex > -1) {
                        var addProductsomefunctionality = _.find($scope.productsAdded, function (obj) {
                            return obj.id === idAcknowledged;
                        });
                        _.pull($scope.productsAdded, addProductsomefunctionality);
                    }

                }

                else if (somefunctionalityType === 'droppedProduct') {
                    var droppedProductIndex = _.indexOf($scope.productsDropped, _.find($scope.productsDropped, function (obj) {
                        return obj.id === idAcknowledged;
                    }));

                    if (isChecked && droppedProductIndex === -1) {
                        $scope.productsDropped.push({
                            id: record.moId + '-' + record.poId,
                            moId: record.moId,
                            poId: record.poId,
                            productId: record.productId
                        });
                    }
                    else if (!isChecked && droppedProductIndex > -1) {
                        var droppedProductsomefunctionality = _.find($scope.productsDropped, function (obj) {
                            return obj.id === idAcknowledged;
                        });
                        _.pull($scope.productsDropped, droppedProductsomefunctionality);
                    }
                }

            }

            else {

                var changeObject = {
                    moIdPoId: record.moId + '-' + record.poId,
                    type: somefunctionalityType,
                    callback: angular.noop,
                    record: record,
                    somefunctionality: record[somefunctionalityType]
                };

                switch (somefunctionalityType) {
                    case 'wholesalePriceChange':
                        changeObject.callback = function (record, somefunctionality) {
                            record.wholesale = parseFloat(somefunctionality.newValue);
                        };
                        break;
                    case 'retailPriceChange':
                        changeObject.callback = function (record, somefunctionality) {
                            record.retail = parseFloat(somefunctionality.newValue);
                        };
                        break;
                    case 'offerDateChange':
                        changeObject.callback = function (record, somefunctionality) {
                            var newOfferDate = Date.parse(somefunctionality.newValue);
                            _.each(record.forecastQty, function (forecastQuantity) {
                                if (!forecastQuantity.isEditable) {
                                    if (forecastQuantity.date <= newOfferDate) {
                                        forecastQuantity.overrideQuantity = 0;
                                    }
                                }
                            });
                        };
                        break;
                    case 'futuresOfferEndDateChange':
                        changeObject.callback = function (record, somefunctionality) {
                            var newOfferDate = Date.parse(somefunctionality.newValue);
                            _.each(record.forecastQty, function (forecastQuantity) {
                                if (!forecastQuantity.isEditable) {
                                    if (forecastQuantity.date > newOfferDate) {
                                        forecastQuantity.overrideQuantity = 0;
                                    }
                                }
                            });
                        };
                        break;
                    case 'linePlanDrop':
                        changeObject.callback = function (record, somefunctionality) {
                            _.each(record.forecastQty, function (item) {

                                item.overrideQuantity = 0;

                            });
                        };
                        break;

                }

                if (record[somefunctionalityType].checked) {
                    addToProductChanged(changeObject);
                }
                else {
                    removeFromProductChanged(changeObject, record);
                }

                //add / remove line plans to line plan obj
                //if that populated, remove those also

                var lastModifiedDate = record[somefunctionalityType].lastModDate;
                var acknowledgedsomefunctionality = {
                    id: idAcknowledged,
                    lastModDate: lastModifiedDate
                };
                var indexAcknowledged = _.indexOf($scope.somefunctionalitysAcknowledged, _.find($scope.somefunctionalitysAcknowledged, function (obj) {
                    return obj.id === idAcknowledged;
                }));

                //add to acknowledged somefunctionalitys collection
                if (isChecked && indexAcknowledged === -1) {
                    $scope.somefunctionalitysAcknowledged.push(acknowledgedsomefunctionality);
                }
                else if (!isChecked && indexAcknowledged > -1) {
                    var somefunctionality = _.find($scope.somefunctionalitysAcknowledged, function (obj) {
                        return obj.id === idAcknowledged;
                    });
                    _.pull($scope.somefunctionalitysAcknowledged, somefunctionality);
                }

            }
        }

        function updateProductsAdded() {
            if (AcknowledgesomefunctionalitysService.productsAdded.length > 0) {
                _.each(AcknowledgesomefunctionalitysService.productsAdded, function (add) {
                    _.each(gridModel.records, function (record) {
                        if (record !== undefined && record.moId + '-' + record.poId === add.id) {
                            record.state = 'CURRENT';
                            gridModel.removeUpdated(record);
                            gridBuilder.refreshGrid();
                        }
                    });
                });
                assortmentPlanViewModel.saveModel();
            }
        }

        function addToProductChanged(changeObject) {
            $scope.productsChanged.push(changeObject)
        }

        function removeFromProductChanged(changeObject, record) {
            var droppedProductsomefunctionality = _.find($scope.productsChanged, function (obj) {
                return obj.moIdPoId === record.moId + '-' + record.poId;
            });
            _.pull($scope.productsChanged, droppedProductsomefunctionality);
        }

        function updateProductsChanged() {

            _.each($scope.productsChanged, function (product) {
                product.callback(product.record, product.somefunctionality);
            });

            assortmentPlanViewModel.saveModel();

        }

        function updateProductsDropped() {
            var remainingsomefunctionalityTypes = ['wholesalePriceChange', 'retailPriceChange', 'offerDateChange', 'futuresOfferEndDateChange', 'linePlanDrop'];

            if (AcknowledgesomefunctionalitysService.productsDropped.length > 0) {
                _.each(AcknowledgesomefunctionalitysService.productsDropped, function (drop) {
                    _.each(gridModel.records, function (record) {
                        if (record && record.moId + '-' + record.poId === drop.id) {

                            _.each(remainingsomefunctionalityTypes, function (somefunctionalityType) {
                                if (record[somefunctionalityType] !== undefined) {
                                    $scope.somefunctionalitysAcknowledged.push({
                                        id: record[somefunctionalityType].id,
                                        lastModDate: record[somefunctionalityType].lastModDate
                                    })
                                }
                            });

                            gridModel.removeRecord(record);

                        }
                    });

                });

                gridBuilder.refreshGrid();

            }

        }

    }

})
(angular);