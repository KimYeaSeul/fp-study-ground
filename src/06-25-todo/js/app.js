(function(window){
    'use strict';

    function View(template){
        this.template = template;
        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;

        this.$todoList = qs('.todo-list');
        this.$todoItemCounter = qs('.todo-count');
        this.$clearCompleted = qs('.clear-completed');
        this.$main = qs('.main');
        this.$footer = qs('.footer');
        this.$toggleAll = qs('.toggle-all');
        this.$newTodo = qs('.new-todo');
    }
    //할일 삭제. data-id 가 true 일때 child삭제하여 목록에서 삭제
    View.prototype._removeItem = function(id){
        var elem = qs('[data-id="'+id+'"]');
        if(elem){
            this.$todoList.removeChild(elem);
        }
    };
    //할일 완료. 완료한 할일의 수(completedCount)와 visible(보여지는 할일의 갯수)를 파라미터로 받아
    //완료한 할일이 있을 경우 clearcompleted 버튼을 보여줌.
    View.prototype._clearCompleteButton = function(completedCount, visible){
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? 'block' : 'none';
    };
    //전체보기랑.. all/active/completed 화면 보여줄라그러나부다
    View.prototype._setFilter = function (currentPage){
        qs('.filters .selected').className = '';
        qs('.filters [href = "#/'+currentPage + '"]').className = 'selected';
    };
    
    View.prototype._elementComplete = function(id,completed){
        var listItem = qs('[data-id="'+id+'"]');
        if(!listItem){
            return;
        }

        listItem.className = completed?'completed':'';
        qs('input',listItem).checked = completed;
    };

    View.prototype._editItem = function(id, title){
        var listItem = qs('[data-id="' + id + '"]');

        if(!listItem){
            return;
        }
        listItem.className = listItem.className + 'editing';
        var input = document.createElement('input');
        input.className = 'edit';

        listItem.appendChild(input);
        input.focus();
        input.value = title;
    };

    View.prototype._editItemDone = function(id, title){
        var listItem = qs('[data-id="' + id + '"]');

        if(!listItem){
            return;
        }

        var input = qs('input.edit', listItem);
        listItem.removeChild(input);
        listItem.className = listItem.className.replace('editing','');

        qsa('label', listItem).forEach(function(label){
            label.textContent = title;
        });
    };

    View.prototype.render = function(viewCmd, parameter){
        var self = this;
        var viewCommands = {
            showEntries:function(){
                self.$todoList.innerHTML = self.template.show(parameter);
            },
            removeItem:function(){
                self._removeItem(parameter);
            },
            updateElementCount:function(){
                self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
            },
            clearCompletedButton:function(){
                self._clearCompletedButton(parameter.completed, parameter.visible);
            },
            contentBlockVisibility:function(){
                self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
            },
            contentBlockVisibility:function(){
                self.$main.style.display = self.$footer.style.display = parameter.visible? 'block':'none';
            },
            toggleAll:function(){
                self.$toggleAll.checked = parameter.checked;
            },
            setFilter:function(){
                self._setFilter(parameter);
            },
            elementComplete:function(){
                self._elementComplete(parameter.id, parameter.completed);
            },
            editItem:function(){
                self._editItem(parameter.id, parameter.title);
            },
            editItemDone:function(){
                self._editItemDone(parameter.id, parameter.title);
            }
        };
        viewCommands[viewCmd]();
    };

    View.prototype._itemId = function(element){
        var li = $parent(element, 'li');
        return parseInt(li.dataset.id, 10);
    };

    View.prototype._bindItemEditDone = function(handler){
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'blur', function(){
            if(!this.dataset.iscanceled){
                handler({
                    id:self._itemId(this),
                    title:this.value
                });
            }
        });

        $delegate(self.$todoList, 'li .edit', 'keypress', function(event){
            if(event.keyCode === self.ENTER_KEY){
                this.blur();
            }
        });
    };

    View.prototype._bindItemEditCancel = function(handler){
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'keyup', function(envent){
            if(event.keyCode == self.ESCAPE_KEY){
                this.dataset.iscanceled = true;
                this.blur();

                handler({id:self._itemId(this)});
            }
        });
    };

    View.prototype.bind = function(event, handler){
        var self = this;
        if(event === 'newTodo'){
            $on(self.$newTodo, 'change', function(){
                handler(self.$newTodo.value);
            });
        }else if (event === 'removeCompleted'){
            $on(self.$clearCompleted, 'click', function(){
                handler();
            });
        }else if(event === 'toggleAll'){
            $on(self.$toggleAll, 'click', function(){
                handler({completed: this.checked});
            });
        }else if(event === 'itemRemove'){
            $delegate(self.$todoList, '.destory', 'click', function(){
                handler({id:self._itemId(this)});
            });
        }else if(event === 'itemToggle'){
            $delegate(self.$todoList, '.toggle','click',function(){
                handler({
                    id:self._itemId(this),
                    completed:this.checked
                });
            });
        }else if(event === 'itemEditDone'){
            self._bindItemEditDone(handler);
        }else if(event === 'itemEditCancle'){
            self._bindItemEditCancel(handler);
        }
    };

    window.app = window.app || {};
    window.app.View = View;

}(window));