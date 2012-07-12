function assembleLists() {
    // URL for board data API
    var api_url = 'http://localhost:8124/api/boards/4fff2b64349066e23b000004';
    // Ajax request for the json file with our data
    var jqxhr = $.getJSON(api_url, function(board_data) {
        // Mustache template
        var template = $('#board_lists_template').html();
        // Creates Mustache rendered html to pop into the board_lists div
        var view = Mustache.to_html(template, board_data);
        $('#board_lists').append(view);

        // Makes all list divs drop-enabled locations
        $('.list').bind('dragenter', function(e) { handleDragEnter(e, this) })
                  .bind('dragleave', function(e) { handleDragLeave(e, this) })
                  .bind('dragover',  function(e) { handleDragOver(e, this) })
                  .bind('drop',      function(e) { handleDrop(e, this) });

        // Iterates over all list items added from data
        $('li').each(function() {
            makeListItemDraggable(this);
        });

        // Allows "+" button to create new list items to add to lists
        $('span.add-on').click(function() {
            var input = $(this).parent().children('input');
            var parent_list = $(this).parent().parent().children('ul');

            parent_list.append('<li>' + input.val() + '</li>');
            input.val(''); 

            makeListItemDraggable(parent_list.children().last());
        });
    })
    .error(function(board_data) { 
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
    e.originalEvent.dataTransfer.setData('text', $(list_item).text());
}

function handleDragEnd(e, list_item) {
    // Removes list_item from its starting point
    $(list_item).remove();
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

function handleDrop(e, list) {
    // Stops default browser redirect on drop event
    if (e.originalEvent.stopPropagation)
        e.originalEvent.stopPropagation();
    if (e.originalEvent.preventDefault)
        e.originalEvent.preventDefault();

    // Appends the list item we have data for to the list we dropped on
    $(list).children('ul').append(
            '<li>'+ e.originalEvent.dataTransfer.getData('text') + '</li>');
    makeListItemDraggable($(list).children('ul').children('li').last());
}

$(document).ready(function() {

    // First, we need to populate list and list item data
    assembleLists();

});
