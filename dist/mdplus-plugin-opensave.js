

// 文件名字
var m_file_name = "last";
var m_file_data = {name: m_file_name, last: "", data: ""};
var m_file_list = {items: []};

// 数据url
var m_url_fileget = "/editor/file_get";
var m_url_filesave = "/editor/file_save";
var m_url_filelist = "/editor/file_list";


function getQueryString(name)
{
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = decodeURI(window.location.search).substr(1).match(reg);
	if (r != null) 
		return unescape(r[2]);
	return null;
}
			
// 兼容node-wikit
var m_url_base = getQueryString('url_base');
if (m_url_base) {
	m_url_fileget = m_url_base + m_url_fileget;
	m_url_filesave = m_url_base + m_url_filesave;
	m_url_filelist = m_url_base + m_url_filelist;	
}

/* 登录处理流程 */
function editor_proc_login() {
    href = 'login.html?pop=1';
    var win = window.open(href, 'login_window', 'height=450,width=780,resizable=yes,scrollbars=yes');
    win.focus();
							            
}

/* 获取数据流程 */
function editor_proc_getdata() {
    if (!m_file_name) {
        return
    }
	$.get(m_url_fileget + "?name=" + m_file_name, function(md){
		m_file_data = md;
		
		/* 未认证 */
		if (md.code == -2) {
		    editor_proc_login();
		}
		
		/* @TODO 判断数据是否一样 */
		editor.session.setValue(m_file_data['data'], -1);				    
		m_file_name = md.name;
		$("title").html(m_file_name);
            		
	});
}

var m_ui_filelist = null;
function editor_file_list(data) {
    Std.main(function(){
        if (m_ui_filelist) {
            m_ui_filelist.clear();
        }
        m_ui_filelist = Std.ui("Tree",{
            renderTo:"#id-editor-list",
            width:300,
            height:'99%',
            checkable:false,
            editable:false,
            droppable:false,
            selectionMode:"item",
            items: data,
            plugins:{
                contextMenu:{
                    items:[
                        {text:"add"},
				        {text:"del"}
                    ]
                }
            }
        });
        
        m_ui_filelist.on("itemClick", function(node,e) { 
            // editor_proc_filesave();
			 if (m_file_name) {
				a_editor_data = editor.session.getValue();
				if (a_editor_data != m_file_data['data']) {
				    a_ret = confirm("文件已经变动，是否要保存?");
				    
				    /* 只在文件 */
				    if (a_ret) {
				        editor_proc_filesave();
				    }
				}
			}
		
            m_file_name = node['opts'].text;
            editor_proc_getdata();
            

        /*@TODO*/});
        
    });
}

// 获取文件列表
function editor_proc_filelist() {
    $.post (
        m_url_filelist,
        m_file_list,
        function (md) {

			/* 未认证 */
			if (md.code == -2) {
				editor_proc_login();
			}
		    
            if (md.code == 0) {
            	editor_file_list(md['data']);
            }

        }
    );
}

/* 保存数据流程 */
function editor_proc_filesave() {
	a_new = false;
	/* @TODO 判断数据是否一样, 如果不一样,才保存, 减少对服务器的请求 */
	if (!m_file_name) {
	    m_file_name = prompt("请输入文件名:");
	    a_new = true;
	}
	
	if (!m_file_name) {
	    return;
	}
	
	/* 判断文件是否存在 */
	m_file_data['name'] = m_file_name;
	$("title").html(m_file_name); 
	m_file_data['data'] = editor.session.getValue();
	$.post (
		m_url_filesave, 
		m_file_data,
		function (md) {
			/* 未认证 */
			if (md.code == -2) {
				editor_proc_login();
			}
			
			/* 文件系统被修订 */
			if (md.code == -1) {
				a_ret = confirm("文件已经被修订, 是否强制保存");
				if (a_ret) { 
					m_file_data['last'] = md.last; 
					editor_proc_filesave();
				}
			}
			
			if (md.code == 0) {		
		    	/* 保存成功 */
		    	editor_proc_filelist();
		    	m_file_data['last'] = md.last;
		    }
	        // @TODO: 处理保存结果
		}
	);
}

/* 新文件处理流程 */
function editor_proc_filenew() {
    if (m_file_name) {
        a_editor_data = editor.session.getValue();
        if (a_editor_data != m_file_data['data']) {
            a_ret = confirm("文件已经变动，是否要保存?");
            
            /* 只在文件 */
            if (a_ret) {
                editor_proc_filesave();
            }
        }
    }
    a_name = prompt("请输入文件名:");
    if ((a_name != null) && (a_name != m_file_name)) {
        m_file_name = a_name;
        $("title").html(m_file_name);
        editor.session.setValue("", -1);
        
        // 打开数据
        editor_proc_getdata();
    }
}


/* 编辑器加载流程 */
function editor_load_proc() {	
	editor_proc_getdata();
	editor_proc_filelist();
	// editor_file_list();
	
	/* 触发保存数据流程 */
	$("#id-editor-save").click(editor_proc_filesave);
	
	/* 触发打开文件的流程 */
	$("#id-editor-new").click(editor_proc_filenew);
	
	/* 增加快捷键 */
    editor.commands.addCommands([
    {
        name: "h1",
        bindKey: {
            win: "Ctrl-1",
            mac: "Command-1"
        },
        exec: function(e) {
            $("#id-editor-h1").click()
        }
    }, 

    {
        name: "h2",
        bindKey: {
            win: "Ctrl-2",
            mac: "Command-2"
        },
        exec: function(e) {
            $("#id-editor-h2").click()
        }
    }, 
    
    {
        name: "h3",
        bindKey: {
            win: "Ctrl-3",
            mac: "Command-3"
        },
        exec: function(e) {
            $("#id-editor-h3").click()
        }
    }, 
    
    {
        name: "h4",
        bindKey: {
            win: "Ctrl-4",
            mac: "Command-4"
        },
        exec: function(e) {
            $("#id-editor-h4").click()
        }
    }, 
    
    {
        name: "h5",
        bindKey: {
            win: "Ctrl-5",
            mac: "Command-5"
        },
        exec: function(e) {
            $("#id-editor-h5").click()
        }
    }, 
    
    {
        name: "h6",
        bindKey: {
            win: "Ctrl-6",
            mac: "Command-6"
        },
        exec: function(e) {
            $("#id-editor-h6").click()
        }
    }, 
    

    {
        name: "save",
        bindKey: {
            win: "Ctrl-s",
            mac: "Command-s"
        },
        exec: function(e) {
            $("#id-editor-save").click()
        }
    }, 
    

    {
        name: "new",
        bindKey: {
            win: "Ctrl-n",
            mac: "Command-n"
        },
        exec: function(e) {
            $("#id-editor-new").click()
        }
    }, 
                    
    {
        name: "preferences",
        bindKey: {
            win: "Ctrl-,",
            mac: "Command-,"
        },
        exec: function(e) {
            $("i.fa-cog").click()
        }
    }, 
    {
        name: "bold",
        bindKey: {
            win: "Ctrl-B",
            mac: "Command-B"
        },
        exec: function(e) {
            $("i.fa-bold").click()
        }
    }, 
    {
        name: "italic",
        bindKey: {
            win: "Ctrl-I",
            mac: "Command-I"
        },
        exec: function(e) {
            $("i.fa-italic").click()
        }
    }, 
    {
        name: "underline",
        bindKey: {
            win: "Ctrl-U",
            mac: "Command-U"
        },
        exec: function(e) {
            $("i.fa-underline").click()
        }
    }
    ]);
	


	
}

$(editor_load_proc);
