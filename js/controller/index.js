iscm.controller('iscm', ['$scope', '$FactoryIndex', function($scope, $FactoryIndex) {

/* for the Developpement ==> info ID connect user */
    $scope.CurrentUserId = 4;

/* bootstrap modal management  */
    var myModal = new bootstrap.Modal(document.getElementById('modalDelete'), {keyboard: false})
    var modalToggle = document.getElementById('modalDelete')

/* Controller management */
    $scope.CurrentUserToday = new Date().getTime(); 

    $scope.domEl = function($el){
        return angular.element(document.querySelector($el));
    }

    $scope.SortFilter = function($data){

        var operators = {
            'score': function(key1,key2) { return key1.score < key2.score },
            'createdAt': function(key1,key2) { return key1.createdAt > key2.createdAt },
        };

        /* Sort by date desc L1 */
        for (const [key, value] of Object.entries($data)){
            
            value.replies.sort(operators['createdAt']);
        }

        /* By score L0 */   
            $data.sort(operators['score']);

        return $data;   
    }


/* Level option send */
    $scope.Reply = function($LEVEL,$KX,$KY){
        $scope.domEl('.'+$LEVEL+'-CardComment-'+$KX+'-'+$KY).removeClass('d-none');
        $scope.domEl('.'+$LEVEL+'-Option-'+$KX+'-'+$KY).addClass('d-none');
        $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val('');
    }

    $scope.ExitReply = function($LEVEL,$KX,$KY){
        $scope.domEl('.'+$LEVEL+'-Comment-'+$KX+'-'+$KY).removeClass('d-none');
        $scope.domEl('.'+$LEVEL+'-CardComment-'+$KX+'-'+$KY).addClass('d-none');
        $scope.domEl('.'+$LEVEL+'-Option-'+$KX+'-'+$KY).removeClass('d-none');
    }

    $scope.Edit = function($LEVEL,$KX,$KY){
        $scope.domEl('.'+$LEVEL+'-Comment-'+$KX+'-'+$KY).addClass('d-none');
        $scope.domEl('.'+$LEVEL+'-CardComment-'+$KX+'-'+$KY).removeClass('d-none');
        $scope.domEl('.'+$LEVEL+'-Option-'+$KX+'-'+$KY).addClass('d-none');
        $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val($scope.domEl('.'+$LEVEL+'-Comment-'+$KX+'-'+$KY).text());
    }

    $scope.Score = function($LEVEL,$KX,$KY,$OP){

        var operators = {
            '+': function(a) { return a + 1 },
            '-': function(a) { return a - 1 },
        };

        element = $scope.domEl('.'+$LEVEL+'-Score-'+$KX+'-'+$KY).text();
        element = $scope.domEl('.'+$LEVEL+'-Score-'+$KX+'-'+$KY).text(operators[$OP](parseInt(element))).text();

        /* UPDATE COMMENT USER LEVEL 0 & 1 */  
        if($LEVEL === "L0"){
            $scope.comments[$KX].score = element;  
        }else if($LEVEL === "L1"){
            $scope.comments[$KX].replies[$KY].score = element;                
        }else{
            alert('Call the developer !!')
        }

        $scope.SortFilter($scope.comments);
        $scope.LocalStorageRestore();
    }


    $scope.Delete = function($LEVEL,$KX,$KY){
        $scope.ctrlPHP={"level":$LEVEL,"objet1":$KX,"objet2":$KY};
        myModal.show(modalToggle);
    }

/* LOCALSTORAGE */   
    $scope.LocalStorage = function(){
        if(sessionStorage.getItem("comments") === null){
            sessionStorage.setItem("comments",JSON.stringify($scope.comments));
        }else{
            try{
                $scope.comments = JSON.parse(sessionStorage.getItem("comments"));
            } catch (e) {
                localStorage.removeItem('comments');
                sessionStorage.setItem("comments",JSON.stringify($scope.comments));
            }
        }        
    } 

    $scope.LocalStorageRestore = function(){
        localStorage.removeItem('comments');
        sessionStorage.setItem("comments",JSON.stringify($scope.comments));
        $scope.comments = JSON.parse(sessionStorage.getItem("comments"));
    } 


/* CRUD */

    $scope.load = function(){
            /* READ JSON INIT */    
            $FactoryIndex.RequestJson('./data.json').then(
                function successCallback(response){
                    $scope.currentUser = response.data.currentUser;
                    $scope.comments = $scope.SortFilter(response.data.comments);
                    $scope.LocalStorage();
                },
                function errorCallback(response) {

                }
            );
    }


    $scope.ConfirmDelete = function(){
        /* DELETE */
        if($scope.ctrlPHP.level === "L0"){
            delete $scope.comments[$scope.ctrlPHP.objet1];
            var $remove = $scope.comments.filter(function (el){return el != null;});
            $scope.comments = $remove           
        }else if($scope.ctrlPHP.level === "L1"){
            delete $scope.comments[$scope.ctrlPHP.objet1].replies[$scope.ctrlPHP.objet2];    
            var $remove = $scope.comments[$scope.ctrlPHP.objet1].replies.filter(function (el){return el != null;});
            $scope.comments[$scope.ctrlPHP.objet1].replies = $remove  
        }else{
            alert('Call the developer !!')
        }

        myModal.hide();
        $scope.SortFilter($scope.comments);
        $scope.LocalStorageRestore();
    }


    $scope.SendReplyEdit = function($LEVEL,$KX,$KY){
        if( $scope.currentUser.username === $scope.domEl('.'+$LEVEL+'-ReplyingTo-'+$KX+'-'+$KY).text()){
        /* UPDATE COMMENT USER LEVEL 0 & 1 */  
            if($LEVEL === "L0"){
                $scope.comments[$KX].content = $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val();
                $scope.comments[$KX].createdAt = $scope.CurrentUserToday;  
            }else if($LEVEL === "L1"){
                $scope.comments[$KX].replies[$KY].content = $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val();
                $scope.comments[$KX].replies[$KY].createdAt = $scope.CurrentUserToday;                
            }else{
                alert('Call the developer !!')
            }
            $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val('');
        }else{
        /* CREATE REPLIES LEVEL 1 */    
            var $data =
                {
                    "id": $scope.CurrentUserId,
                    "content": $scope.domEl('.'+$LEVEL+'-Textarea-'+$KX+'-'+$KY).val(),
                    "createdAt": $scope.CurrentUserToday ,
                    "score": 0,
                    "replyingTo": $scope.domEl('.'+$LEVEL+'-ReplyingTo-'+$KX+'-'+$KY).text(),
                    "user": {
                    "image": { 
                        "png": $scope.currentUser.image.png,
                        "webp": $scope.currentUser.image.webp
                    },
                    "username": $scope.currentUser.username
                    }
                };

            $scope.comments[$KX].replies.push($data);
        }
        $scope.SortFilter($scope.comments);
        $scope.LocalStorageRestore();
        $scope.ExitReply($LEVEL,$KX,$KY)
    }


    $scope.SendNewComment = function($LEVEL){
        /* CREATE COMMENTS LEVEL 2 */ 
        var $data =
            {
                "id": $scope.CurrentUserId,
                "content": $scope.domEl('.'+$LEVEL+'-Textarea').val(),
                "createdAt": $scope.CurrentUserToday ,
                "score": 0,
                "user": {
                "image": { 
                    "png": $scope.currentUser.image.png,
                    "webp": $scope.currentUser.image.webp
                },
                "username": $scope.currentUser.username
                },
                "replies": []
            };

        $scope.comments.push($data);
        $scope.SortFilter($scope.comments);
        $scope.LocalStorageRestore();
        $scope.domEl('.'+$LEVEL+'-Textarea').val('');
    }


 }]);