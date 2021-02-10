// AJAX
const responseMessage = (message, isSuccess) => {
    if (isSuccess) $('.ajax-message').css({ 'color': 'green' })
    else $('.ajax-message').css({ 'color': 'red' });

    $('.ajax-message').css({ 'display': 'inline', 'font-size': '150%' });
    $('.ajax-message').html(message);
    $('.ajax-message').delay(2000).fadeOut('slow');
}

// lets have a constanta, where to store all of passages instead of LS
// this constanta will be filled with page loading or response from ajaxGetPassagess
const storage = {
    // fills in storage from backend
    fill: function (data) {
        for (item in data) {
            this.data[item] = data[item];
        };
    },
    // saves storage to DB
    save: function () {
        for (key in this.data) {
            var data = this.data[key];
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            };
            ldb.set(key, data);
        }
    },
    // loads storage from DB
    loadFromDB: async function () {
        const keys = ['attributes', 'passages', 'projectDir', 'projectName', 'projectPath'];

        const promises = keys.map((key) => {
            return new Promise((resolve) => {
                ldb.get(key, function (val) {
                    try {
                        val = JSON.parse(val);
                    } catch (e) {
                        // pass
                    };
                    storage.data[key] = val;

                    resolve();
                });
            })
        });
        return Promise
            .all(promises)
            .then(() => storage.data);
    },
    clear: function () {
        this.data = {};
        const keys = ['attributes', 'passages', 'projectDir', 'projectName', 'projectPath'];
        keys.map((key) => {
            ldb.set(key, undefined);
        })
    },
    data: {}
};

const ajaxGetPassages = () => {
    $.ajax({
        url: '/passages',
        type: 'get',
        headers: {
            "Content-Type": "application/json",
            "path": storage.data.projectPath
        },
        success: (res) => {
            responseMessage('Done', true)
            storage.fill({passages: res.elements});
            storage.save();
            console.log("Result of GET /passages: ", res);
            res.elements.forEach((el) => {
                el.connections = []; //getPassageConnections(el)
            })
            storage.save();

            showPassagesControl();
        },
        error: (req, status, error) => {
            if (error) {
                const res = JSON.parse(req.responseText);
                var error = 'error';
                if (res.error) error = res.error;
                responseMessage(error, false)
                console.log(req.responseText);
                console.log(status);
            };
        }
    });
};

const ajaxPostPassages = () => {
    const data = JSON.stringify({
        elements: storage.data.passages
    })
    const attributes = storage.data.attributes;
    const { name, startnode, creator, ifid, zoom, format, options, hidden } = attributes
    const headers = {
        name,
        startnode,
        creator,
        "creator-version": attributes["creator-version"],
        ifid,
        zoom,
        format,
        "format-version": attributes["format-version"],
        options,
        hidden,
        "path": storage.data.projectPath,
        "projectDir": storage.data.projectDir,
        "projectName": storage.data.projectName,
        "Content-Type": "application/json"
    };

    $.ajax({
        url: '/passages',
        type: 'post',
        data: data,
        headers: headers,
        success: (res) => {
            responseMessage('Compiled', true);
            console.log("Result of POST /passages: ", res);
        },
        error: (req, status, error) => {
            const res = JSON.parse(req.responseText);
            var error = 'error';
            if (res.error) error = res.error;
            responseMessage(error, false);
            console.log(req.responseText);
            console.log(status);
        }
    });
};

const ajaxProjectInit = () => {
    const path = $('#path-input').val();
    const data = JSON.stringify({path});
    if (!path) {
        return $("#path-input").css({ "border": '#FF0000 2px solid'});
    };
    $.ajax({
        url: '/init/project',
        type: 'post',
        data: data,
        headers: {
            "Content-Type": "application/json"
        },
        success: (res) => {
            $('.scheme').empty();
            console.log("Result of POST /init/project: ", res);
            responseMessage('Done', true);
            storage.fill(res);
            setProjectName();
            $('footer').fadeIn();
            ajaxGetPassages();
        },
        error: (req, status, error) => {
            if (error) {
                const res = JSON.parse(req.responseText);
                var error = 'error';
                if (res.error) error = res.error;
                responseMessage(error, false);
                console.log(req.responseText);
                console.log(status);

            };
        }
    });
};

const closeProject = () => {
    $('#close-modal').modal();
    $('.jquery-modal').css('z-index', 100)
}

$('#start-input-submit').on('click', ajaxProjectInit);
$('#start-load').on('click', () => { $('.start-input').fadeIn() })
$('#start-about').on('click', () => {$('#about-modal').modal();});
$('#compile-project').on('click', ajaxPostPassages);
$('#close-project').on('click', closeProject);

// SCHEME

$('.close-submit').on('click', () => {
    storage.clear();
    location.reload();
})

const setProjectName = () => {
    const name = storage.data.projectName;
    if (name) {
        $('.project-name').text(name.toUpperCase() + ' PROJECT').css('color', 'rgba(0, 0, 0, 0.1)')
    } else {
        $('.project-name').text('TWINE EDITOR').css('color', 'black')
    };
}

// on load checking if we have a local storage passages loaded
$( window ).on( "load", async () => {
    storage.loadFromDB().then((val) => {
        setProjectName();
        if (val.passages) {
            showPassagesControl();
        }
        else showProjectsControl();
    });
} );

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"pointer"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top: e.pageY + pos_y - drg_h,
                    left: e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
            changeSchemaItemPosition(this)
        });

    };
})(jQuery);

const showPassagesControl = () => {
    $('.start-input').fadeOut();
    $('.start-buttons').fadeOut();
    $('footer').fadeIn();
    fillSchemaItems();
};

const showProjectsControl = () => {
    $('footer').fadeOut();
    $('.scheme')
    .css('height', '500px')
    .css('width', $( window ).width());
    $('.start-buttons').fadeIn();
};

// check passage name for identity
const ifNameIsLegal = (name, pasObj) => {
    var result = true;
    for (pas of storage.data.passages) {
        if (pas.name === name && pas.pid !== pasObj.pid) {
            console.log(pas.pid, pasObj.pid);
            result = false;
            break;
        };
    };
    return result;
};

// delete passage
const deletePassage = (pid) => {
    pid = parseInt(pid);
    storage.data.passages.splice(pid-1, 1);
    recalculatePIDs(storage.data.passages);
    $($('.scheme-item')[pid-1]).remove();
    storage.save();
};

// recalculate PIDS after deleting 1 of them
const recalculatePIDs = (passages) => {
    var lastPID = 0
    for (p of passages) {
        if (parseInt(p.pid) !== lastPID + 1) { p.pid = (lastPID + 1).toString() }
        lastPID += 1;
    };
};

// add new passage
const addNewPassage = () => {
    const passageName = "Untitled Passage ";
    const pid = (storage.data.passages.length + 1).toString();
    const name = passageName + pid;
    heightC = $(window).scrollTop() + Math.floor($(window).height() / 2);
    widthC = $(window).scrollLeft() + Math.floor($(window).width() / 2);
    
    const newPas = {
        name,
        pid,
        position: `${widthC},${heightC}`,
        size: "100,100",
        tags: "",
        text: "",
        connections: []
    };

    storage.data.passages.push(newPas);
    storage.save();
    console.log(newPas);
    addNewPassageToPage(newPas);
};
$('.add-passage-button').on('click', (e) => { addNewPassage() })

// calculate size (height, width) of scheme
const calculateSchemeSize = () => {
    var lastElHeight = 0;
    var lastElWidth = 0;
    $('.scheme-item').each((index, val) => {
        const height = $(val).offset().top;
        const width = $(val).offset().left;
        if (lastElHeight < height) lastElHeight = height;
        if (lastElWidth < width) lastElWidth = width;
    })
    $('.scheme')
        .css('height', (lastElHeight + 300).toString() + 'px')
        .css('width', (lastElWidth + 300).toString() + 'px');
}

// checks if it's drag or click
$(document).on('mousedown', function(e) {
    $(this).data('p0', { x: e.pageX, y: e.pageY });
}).on('mouseup', function(e) {
    var p0 = $(this).data('p0'),
        p1 = { x: e.pageX, y: e.pageY },
        d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));

    calculateSchemeSize();

    var el = e.target;
    if ($(el).hasClass('scheme-item') || $(el).hasClass('scheme-item-name')) {
        if ($(el).hasClass('scheme-item-name')) el = $(el).parent();
        $(el).css("z-index", '');
        if (d < 4) clickOnSchemaItem(el);
    };
});

const addNewPassageToPage = (pas) => {
    const pos = pas.position.split(','); 
    var schemeEl = $.parseHTML(`<div class="scheme-item"></div>`);
    $(schemeEl).css('left', pos[0]+'px').css('top', pos[1]+'px');
    $(schemeEl).attr('pid', pas.pid);
    $(schemeEl).append(`<div class="scheme-item-name">${pas.name}<div>`)
    $(schemeEl).append(`<a href="#delete-passage" pid=${pas.pid} class="delete-passage">X</a>`)

    $('.scheme').append($(schemeEl));
    $('.scheme-item').drags();

    // show delete button while hovering on the passage element
    $(schemeEl)
        .mouseover(() => { 
            $($(schemeEl).find('.delete-passage')).css('display', 'block');
        })
        .mouseout(() => {
            $($(schemeEl).find('.delete-passage')).css('display', 'none');
        })
    $(schemeEl).on('click', '.delete-passage', () => {
        deletePassage(pas.pid);
    })
}

const fillSchemaItems = () => {
    storage.data.passages.forEach((pas) => {
        addNewPassageToPage(pas);
    });
    calculateSchemeSize();
};

const changeSchemaItemPosition = (el) => {
    const coords = `${parseInt($(el).css('left'))},${parseInt($(el).css('top'))}`;
    const iter = parseInt($(el).attr('pid')) - 1;
    storage.data.passages[iter].position = coords;

    storage.save();
};

const clickOnSchemaItem = (el) => {
    const iter = parseInt($(el).attr('pid')) - 1;
    showEdit(storage.data.passages[iter]);
};

// TODO: search for refs in passages
const getPassageConnections = (passageAsObj) => {
    const commonRegex = /\[\[.*\]\]/gm; // search for [[*]]
    const coupleRegex = /\]\[/gm; //search for ][ in case of [[*][*]]
    const refRegex = /\|.*\]/gm; // search for |*] in case of [[*|*]]
    var found = passageAsObj.text.match(commonRegex);
    if (found) {
        for (i in found) {
            const foundCouple = found[i].match(coupleRegex);
            if (foundCouple) found[i] = found[i].split(coupleRegex)[0].split('|')[1];
            const foundRef = found[i].match(refRegex);
            if (foundRef) found[i] = foundRef[0].replace('|','').replace(/\]/gm, '');
            else found[i] = found[i].replace(/\]\]/, '').replace(/\[\[/, '');
        };
    } else found = [];
    return found
}


// PASSAGE EDIT
var textareaOldText = '';
var timer;
const insertPosition = {
    startPosition: 0,
    finishPositionOfWordToChange: 0
};

const variables = [];
const codeSnippets = [
    '[[Link]]',
    '[[Text|Link]]',
    '[[Link][Setter]]',
    '[[Text|Link][Setter]]',
    '[img[Image]]',
    '[img[Image][Link]]',
    '[img[Image][Link][Setter]]',
    '[img[Title|Image]]',
    '[img[Title|Image][Link]]',
    '[img[Title|Image][Link][Setter]]',
    '{{{Code}}}',
    '&lt;&lt;link&gt;&gt;Link&lt;&lt;/link&gt;&gt;',
    '&lt;&lt;set Code&gt;&gt;',
    '&lt;&lt;unset Code&gt;&gt;',
    '&lt;&lt;script&gt;&gt;Script&lt;&lt;/script&gt;&gt;',
    '&lt;&lt;= Expression&gt;&gt;',
    '&lt;&lt;include passageName [elementName]&gt;&gt;',
    '&lt;&lt;include linkMarkup [elementName]&gt;&gt;',
    '&lt;&lt;nobr&gt;&gt;Nobr&lt;&lt;/nobr&gt;&gt;',
    '&lt;&lt;print Expression&gt;&gt;',
    '&lt;&lt;silently&gt;&gt;Silently&lt;&lt;/silently&gt;&gt;',
    '&lt;&lt;type speed [start delay] [class classes] [element tag] [id ID] [keep|none] [skipkey key]&gt;&gt;Expression&lt;&lt;/type&gt;&gt;',
    '&lt;&lt;if Conditional&gt;&gt;Code&lt;&lt;/if&gt;&gt;',
    '&lt;&lt;if Conditional&gt;&gt;Code&lt;&lt;elseif Conditional&gt;&gt;Code&lt;&lt;/if&gt;&gt;',
    '&lt;&lt;if Conditional&gt;&gt;Code&lt;&lt;elseif Conditional&gt;&gt;Code&lt;&lt;else&gt;&gt;Code&lt;&lt;/if&gt;&gt;',
    '&lt;&lt;for [Conditional]&gt;&gt;Code&lt;&lt;/for&gt;&gt;',
    '&lt;&lt;break&gt;&gt;',
    '&lt;&lt;continue&gt;&gt;',
    '&lt;&lt;switch Expression&gt;&gt;Code&lt;&lt;/switch&gt;&gt;',
    '&lt;&lt;button linkText [passageName]&gt;&gt;Code&lt;&lt;/button&gt;&gt;',
    '&lt;&lt;button linkMarkup&gt;&gt;Code&lt;&lt;/button&gt;&gt;',
    '&lt;&lt;button imageMarkup&gt;&gt;Code&lt;&lt;/button&gt;&gt;',
    '&lt;&lt;listbox receiverName [autoselect]&gt;&gt;[&lt;&lt;option label [value [selected]]&gt;&gt; …][&lt;&lt;optionsfrom collection&gt;&gt; …]&lt;&lt;/listbox&gt;&gt;',
    '&lt;&lt;numberbox receiverName defaultValue [passage] [autofocus]&gt;&gt;',
    '&lt;&lt;radiobutton receiverName checkedValue [autocheck|checked]&gt;&gt;',
    '&lt;&lt;textarea receiverName defaultValue [autofocus]&gt;&gt;',
    '&lt;&lt;textbox receiverName defaultValue [passage] [autofocus]&gt;&gt;',
    '&lt;&lt;actions List&gt;&gt;',
    '&lt;&lt;back [linkText]&gt;&gt;',
    '&lt;&lt;choice passageName [linkText]&gt;&gt;',
    '&lt;&lt;return [linkText]&gt;&gt;',
    '&lt;&lt;addclass selector classNames&gt;&gt;',
    '&lt;&lt;append selector [transition|t8n]&gt;&gt; … &lt;&lt;/append&gt;&gt;',
    '&lt;&lt;copy selector&gt;&gt;',
    '&lt;&lt;prepend selector [transition|t8n]&gt;&gt; … &lt;&lt;/prepend&gt;&gt;',
    '&lt;&lt;remove selector&gt;&gt;',
    '&lt;&lt;removeclass selector [classNames]&gt;&gt;',
    '&lt;&lt;replace selector [transition|t8n]&gt;&gt; … &lt;&lt;/replace&gt;&gt;',
    '&lt;&lt;toggleclass selector classNames&gt;&gt;',
    '&lt;&lt;audio trackIdList actionList&gt;&gt;',
    '&lt;&lt;cacheaudio trackId sourceList&gt;&gt;',
    '&lt;&lt;createaudiogroup groupId&gt;&gt;[&lt;&lt;track trackId&gt;&gt; …]&lt;&lt;/createaudiogroup&gt;&gt;',
    '&lt;&lt;createplaylist listId&gt;&gt;[&lt;&lt;track trackId actionList&gt;&gt; …]&lt;&lt;/createplaylist&gt;&gt;',
    '&lt;&lt;masteraudio actionList&gt;&gt;',
    '&lt;&lt;removeaudiogroup groupId&gt;&gt;',
    '&lt;&lt;removeplaylist listId&gt;&gt;',
    '&lt;&lt;waitforaudio&gt;&gt;',
    '&lt;&lt;goto passageName&gt;&gt;',
    '&lt;&lt;repeat delay [transition|t8n]&gt;&gt; … &lt;&lt;/repeat&gt;&gt;',
    '&lt;&lt;stop&gt;&gt;',
    '&lt;&lt;widget widgetName&gt;&gt; … &lt;&lt;/widget&gt;&gt;'
];


const savePassage = (passageAsObj) => {
    const iter = parseInt(passageAsObj.pid) - 1
    $($('.scheme-item-name')[iter]).text(passageAsObj.name);
    storage.data.passages[iter] = passageAsObj
    passageAsObj.connections = getPassageConnections(passageAsObj)
    storage.save();
}

$(document).on('click', '.jquery-modal', (e) => {
    if ($(e.target).hasClass('jquery-modal')) $('.passage-edit-close').click();
});

const passageTextField = {
    selector: '.passage-body',
    getText: function() {
        return $(this.selector).val()
    },
    setText: function(text) {
        $(this.selector).val(text)
    },
    lastChanges: {
        pos: 0,
        text: ''
    }
};

const showEdit = (passageAsObj) => {
    $('#passage-name').val(passageAsObj.name)

    textareaOldText = passageAsObj.text;
    passageTextField.setText(passageAsObj.text);

    var nameIsOk = true;
    // on input name of passage
    $('#passage-name').on('input paste', function() {
        if (!ifNameIsLegal($(this).val(), passageAsObj)) {
            $(this).css({ "border": '#FF0000 1px solid'});
            nameIsOk = false;
        } else {
            $(this).css('border', 'black 1px solid');
            nameIsOk = true;
        };
      });

    // escape handlers
    const escButton = $('.passage-edit-close')
    escButton.on('click', () => {
        if (!nameIsOk) {
            $(this).css('border', 'black 1px solid');
            $('#passage-name').val(Math.random().toString(36).substring(5,7));
        }
        if ($('#passage-name').val()) passageAsObj.name = $('#passage-name').val()
        if (passageTextField.getText()) passageAsObj.text = passageTextField.getText()
        console.log(passageAsObj);
        savePassage(passageAsObj);

        $('#passage-name').val('')
        passageTextField.setText('')
        $('.passage-suggestions').empty();
        escButton.off('click')
    })
    $(document).keyup(function(e){
        if (e.which == 27) {
            if ($('#passage-name').val() !== '' || passageTextField.getText() !== '') escButton.click();
        }
    });

    $('#passage-edit-modal').modal({ closeClass: '.passage-edit-close' })
    // remove default modal esc button
    $('.close-modal').remove()
}

// on change
$(passageTextField.selector).on('change keyup', function() {
    const newText = passageTextField.getText();
    handleTextChanges(textareaOldText, newText);
    setSuggestions();
});

// TODO: sometimes works incorrectly
const getWordDiffs = (was, become) => {
    if (!was) return become;
    var changes = '';
    if (was.length >= become.length) {
        for (i in become) {
            if (was[i] !== become[i]) {
                changes = become[i];
                break;
            };
        };
    } else if (was.length === become.length) {
        for (i in was) {
            if (was[i] !== become[i]) {
                changes = become[i];
                break;
            };
        };
    } else {
        changes = become.slice(-1);
    };
    return changes;
}

const handleTextChanges = (x, y) => {
    const x_arr=x.split(' ');
    const y_arr=y.split(' ');
    var whereToCount;
    var diff;

    if (y_arr.length >= x_arr.length) whereToCount = x_arr
    else whereToCount = y_arr;
    for (i in whereToCount) {
        if (x_arr[i] !== y_arr[i]) {
            diff = getWordDiffs(x_arr[i], y_arr[i]);
            break;
        }
    };

    const caretPos = $(passageTextField.selector).caret();
    if (diff) {
        if (passageTextField.lastChanges.pos+1 === caretPos) {
            passageTextField.lastChanges.pos = caretPos;
            passageTextField.lastChanges.text += diff;    
        } else {
            passageTextField.lastChanges.pos = caretPos;
            passageTextField.lastChanges.text = diff;
        }
    } else {
        // passageTextField.lastChanges.pos = 0;
        // passageTextField.lastChanges.text = '';
    }
    console.log(passageTextField.lastChanges);

    textareaOldText = y;
}

const insertText = (text) => {
    const string = [
        textareaOldText.substring(0, passageTextField.lastChanges.pos - passageTextField.lastChanges.text.length),
        textareaOldText.substring(passageTextField.lastChanges.pos)
    ];
    const newText = string[0] + text + string[1];
    textareaOldText = newText;
    $('.passage-body').val(newText);
}

const setSuggestions = () => {
    console.log('click');
    var suggestions = [];
    var textChange = passageTextField.lastChanges.text;
    textChange = textChange.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    console.log(textChange);

    for (i in codeSnippets) {
        const index = codeSnippets[i].indexOf(textChange)
        if (index >= 0) suggestions.push(codeSnippets[i])
    }
    if (passageTextField.lastChanges.text === '') suggestions = [];
    console.log({ suggestions });

    if (suggestions.length > 0) $('.passage-suggestions').empty();
    suggestions.forEach((sug) => {
        $('.passage-suggestions').append(`<span class="sugest-item">${sug}</span>`)
    })
};

$('.passage-suggestions').on('click', '.sugest-item', (e) => {
    $(this).addClass('pressed');
    setTimeout(function(){
        $('.button').removeClass('pressed');
    },500);

    const text = $(e.target).text()
    insertText(text);
})

// all <a> refs in 'about' modal will be opened in new tab (but not close modal link)
$('#about-modal').on('click', 'a', (e) => {
    const url = $(e.target).attr('href');
    if (url === '#close-modal') return ;
    e.preventDefault();
    window.open(url, '_blank');
})