/*global describe*/
/*global it */
/*global expect*/
/*global inject*/
/*global sinon*/
/*global beforeEach*/
/*global $*/
'use strict';

describe ('Controllers', function () {
    var hello = {hello: 'world'},
        $rs, $scope,
        $resource = function () {
                        return resourceStub;
                    },
        miscServiceStub = function () {this.changeFileUploaderSuccess = sinon.spy();},
        resourceStub;


    function initializeController($controller, name, $rootScope) {
        if (typeof $rootScope === 'undefined') {
            $rootScope = {};
        }
        $rs = $rootScope;
        $scope = $rootScope;

        $controller(name + 'Controller', {
            $rootScope: $rs,
            $scope: $scope,
            $resource: $resource,
            $routeParams: hello,
            $cookies: {csrftoken: 'test token'},
            $miscUtils: new miscServiceStub()
        });
    }

    describe ('Forms Controller', function () {
        beforeEach(function () {
            resourceStub = {
                    query: sinon.stub().returns(hello)
                };
        });
        it('should initialize $rootScope and $scope correctly', inject(function ($controller, $rootScope) {
            initializeController($controller, 'Forms', $rootScope);

            expect($rs.canAddNew).toBe(true);
            expect($rs.activeTab).toBe('Forms');

            expect($scope.infoListItems).toBe(hello);
        }));

        describe('$scope.deleteSurvey', function () {
            it('should delete survey when user confirms deletion', inject(function ($controller, $rootScope) {
                var confirmStub = sinon.stub(),
                    deleteSpy = sinon.spy();

                miscServiceStub = function () {
                    this.confirm = confirmStub;
                    this.changeFileUploaderSuccess = sinon.spy();
                };
                confirmStub.returns(true);

                initializeController($controller, 'Forms', $rootScope);

                $scope.deleteSurvey({ id:0, $delete: deleteSpy });

                expect(confirmStub).toHaveBeenCalledOnce();
                expect(deleteSpy).toHaveBeenCalledOnce();
            }));

            it('should not delete survey when user cancels deletion', inject(function ($controller, $rootScope) {
                var confirmStub = sinon.stub(),
                    deleteSpy = sinon.spy();

                miscServiceStub = function () {
                    this.confirm = confirmStub;
                    this.changeFileUploaderSuccess = sinon.spy();
                };
                confirmStub.returns(false);

                initializeController($controller, 'Forms', $rootScope);

                $scope.deleteSurvey({ id:0, $delete: deleteSpy });

                expect(confirmStub).toHaveBeenCalledOnce();
                expect(deleteSpy).not.toHaveBeenCalled();
            }));
        });

        describe('$scope.$watch("infoListItems")', function () {
            it('should set additionalClasses = content-centered when infoListItems is empty', inject (function ($controller, $rootScope) {
                initializeController($controller, 'Forms', $rootScope);

                $rs.infoListItems = [];
                $rs.$apply();

                expect($rs.additionalClasses).toBe('content--centered');
            }));

            it('should set additionalClasses = "" when infoListItems contains elements', inject (function ($controller, $rootScope) {
                initializeController($controller, 'Forms', $rootScope);

                $rs.infoListItems = [1];
                $rs.$apply();

                expect($rs.additionalClasses).toBe('');
            }));
        })
    });

    describe('Assets Controller', function () {
        it('should initialize $scope and $rootScope correctly', inject(function ($controller) {
            initializeController($controller, 'Assets');

            expect($rs.canAddNew).toBe(true);
            expect($rs.activeTab).toBe('Assets');

            expect($scope.infoListItems).toBe(hello);
        }));
    });

    describe('Header Controller', function () {
        beforeEach(function () {
            miscServiceStub = function () {
                this.bootstrapFileUploader = function () {};
                this.changeFileUploaderSuccess = sinon.spy();
            };
        });


        it('should initialize $scope and $rootScope correctly', inject(function ($controller, $rootScope) {
            initializeController($controller, 'Header', $rootScope);

            expect($scope.pageIconColor).toBe('teal');
            expect($scope.pageTitle).toBe('Forms');
            expect($scope.pageIcon).toBe('fa-file-text-o');
            expect($scope.topLevelMenuActive).toBe('');
            expect($rs.activeTab).toBe('Forms');
        }));

        describe('$scope.toggleTopMenu', function () {
            it('should set the value of $scope.topLevelMenuActive to "is-active" when its value is an empty string',
                inject(function ($controller, $rootScope) {
                    initializeController($controller, 'Header', $rootScope);

                    $rs.topLevelMenuActive = '';
                    $scope.toggleTopMenu();

                    expect($rs.topLevelMenuActive).toBe('is-active');
                })
            );

            it('should set the value of $scope.topLevelMenuActive to an empty string when its value is "is-active"',
                inject(function ($controller, $rootScope) {
                    initializeController($controller, 'Header', $rootScope);

                    $rs.topLevelMenuActive = 'is-active';
                    $scope.toggleTopMenu();

                    expect($rs.topLevelMenuActive).toBe('');
                })
            );
        });
    });

    describe('Builder Controller', function () {
        beforeEach(function () {
            window.$ = sinon.stub();
            $.withArgs(window).returns({bind: sinon.stub(), unbind: sinon.stub()});
        });

        it('should initialize $scope and $rootScope correctly', inject(function ($controller, $rootScope) {
            initializeController($controller, 'Builder', $rootScope);

            expect($rs.activeTab).toBe('Forms');
            expect($scope.routeParams).toBe(hello);
        }));

        describe('Location Change Confirmation', function () {
            it('Should change location when user accepts confirmation', inject(function ($controller, $rootScope) {
                var confirmStub = sinon.stub();

                miscServiceStub = function () {
                    this.confirm = confirmStub;
                    this.changeFileUploaderSuccess = sinon.spy();
                };
                confirmStub.returns(true);

                initializeController($controller, 'Builder', $rootScope);
                $rootScope.deregisterLocationChangeStart = sinon.spy();

                $rs.$broadcast('$locationChangeStart');
                expect(confirmStub).toHaveBeenCalledOnce();
                expect(confirmStub).toHaveBeenCalledWith('Are you sure you want to leave? you will lose any unsaved changes.');
                expect($rootScope.deregisterLocationChangeStart).toHaveBeenCalledOnce();

                miscServiceStub = function (){};
            }));

            it('Should keep location when user rejects confirmation', inject(function ($controller, $rootScope) {
                var confirmStub = sinon.stub(),
                    preventDefaultSpy = sinon.spy();

                miscServiceStub = function () {
                    this.confirm = confirmStub;
                    this.preventDefault = preventDefaultSpy;
                    this.changeFileUploaderSuccess = sinon.spy();
                };

                confirmStub.returns(false);

                initializeController($controller, 'Builder', $rootScope);

                $rs.$broadcast('$locationChangeStart');

                expect(confirmStub).toHaveBeenCalledOnce();
                expect(confirmStub).toHaveBeenCalledWith('Are you sure you want to leave? you will lose any unsaved changes.');
                expect(preventDefaultSpy).toHaveBeenCalledOnce();

                miscServiceStub = function () {};
            }));

        });
    });

    describe('Import Controller', function () {
        it('should initialize $scope and $rootScope correctly', inject(function ($controller, $rootScope) {
            initializeController($controller, 'Import', $rootScope);

            expect($scope.csrfToken).toBe('test token');
            expect($rs.canAddNew).toBe(false);
            expect($rs.activeTab).toBe('Import CSV');
        }));
    });
});