// URL for board data API
var api_url_base = 'http://localhost:8124/boards'
var api_url_board = 'http://localhost:8124/boards/4fffb859dfaf22fc01000005';

function pushUpdateToAPI(board_data) {
    var jqxhr = $.ajax({
        url: api_url_board,
        type: "PUT",
        data: board_data
    });
    jqxhr.success(function() {
        assembleLists();
    });
    jqxhr.error(function(board_data) {
        alert('Problem with the data ' + board_data)
    });
}

function addItemJSON(board_data, list_name, item_text) {
    $.each(board_data.lists, function(key, val) {
        if (val.name == list_name) {
            if (board_data.lists[key].items instanceof Array) {
                board_data.lists[key].items.push({text: item_text});
            } else {
                board_data.lists[key].items = [{text: item_text}];
            }
        }
    });

    return board_data;
}

function removeItemJSON(board_data, list_name, item_text) {
    $.each(board_data.lists, function(key, val) {
        if (val.name == list_name) {
            $.each(board_data.lists[key].items, function(item_key, item_val) {
                if(item_val.text == item_text) {
                    board_data.lists[key].items.splice(item_key, 1);
                }
            });
        }
    });

    return board_data;
}

function assembleLists() {
    // Ajax request for the json file with our data
    var jqxhr = $.getJSON(api_url_board, function(board_data) {
        // Mustache template
        var template = $('#board_lists_template').html();
        // Creates Mustache rendered html to pop into the board_lists div
        var view = Mustache.to_html(template, board_data);
        $('.container').html(view);

        // Makes all list divs drop-enabled locations
        $('.list').bind('dragenter', function(e) { handleDragEnter(e, this) })
                  .bind('dragleave', function(e) { handleDragLeave(e, this) })
                  .bind('dragover',  function(e) { handleDragOver(e, this) })
                  .bind('drop', function(e) {
                      handleDrop(e, this, board_data)
                  });

        // Iterates over all list items added from data
        $('.list li').each(function() {
            makeListItemDraggable(this);
        });

        // Allows "+" button to create new list items to add to lists
        $('span.add-on').click(function() {

            var item_text = $(this).parent().children('input').val();
            var list_name = $(this).parent().parent().children('h1').text();

            board_data = addItemJSON(board_data, list_name, item_text);
            pushUpdateToAPI(board_data);

        });

        // Reading enter key press for item inputs
        $('input').keyup(function(event){
            if(event.keyCode == 13){
                $(this).parent().children('span').click();
            }
        });

        $('i.remove_item').click(function() {

            var item_text = $(this).parent().children('span').text();
            var list_name
                = $(this).parent().parent().parent().children('h1').text();

            board_data = removeItemJSON(board_data, list_name, item_text);
            pushUpdateToAPI(board_data);

        });
    });
    jqxhr.error(function(board_data) {
        alert('Problem with the data ' + board_data)
    });
}


function makeListItemDraggable(list_item) {
    // Enables dragging on list_item
    $(list_item).attr('draggable', 'true')
                .bind('dragstart', function(e) { handleDragStart(e, this) })
                .bind('dragend',   function(e) { handleDragEnd(e, this) });
}

function handleDragStart(e, list_item) {
    // Allows list_item to have its text information copied
    e.originalEvent.dataTransfer.effectAllowed = 'copy';
    e.originalEvent.dataTransfer.setData('text',
        $(list_item).children('span').text() + '|'
        + $(list_item).parent().parent().children('h1').text());
}

function handleDragEnd(e, list_item) {
    //handle it!
}

function handleDragEnter(e, list) {
    //handle it!
}

function handleDragLeave(e, list) {
    //handle it!
}

function handleDragOver(e, list) {
    // We need this to allow drop event to work. WTF.
    if (e.originalEvent.preventDefault)
        e.originalEvent.preventDefault();
}

function handleDrop(e, list, board_data) {
    // Stops default browser redirect on drop event
    if (e.originalEvent.stopPropagation)
        e.originalEvent.stopPropagation();
    if (e.originalEvent.preventDefault)
        e.originalEvent.preventDefault();

    var item_text = e.originalEvent.dataTransfer.
        getData('text').split('|')[0];
    var org_list_name = e.originalEvent.dataTransfer.
        getData('text').split('|')[1];
    var des_list_name = $(list).children('h1').text();

    board_data = removeItemJSON(board_data, org_list_name, item_text);
    board_data = addItemJSON(board_data, des_list_name, item_text);
    pushUpdateToAPI(board_data);
/*
    // Appends the list item we have data for to the list we dropped on
    $(list).children('ul').append(
            '<li>'+ e.originalEvent.dataTransfer.getData('text') + '</li>');
    makeListItemDraggable($(list).children('ul').children('li').last());
    */
}

$(document).ready(function() {

    // First, we need to populate list and list item data
    assembleLists();

});
