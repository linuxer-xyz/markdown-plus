

// 文件名字
var m_file_name = "test";
var m_file_data = {name: m_file_name, last: "", data: ""};

// 数据url
var m_url_fileget = "http://localhost:9000/editor/file_get";
var m_url_filesave = "http://localhost:9000/editor/file_save"

/* 获取数据流程 */
function editor_proc_getdata() {
	$.get(m_url_fileget + "?name=" + m_file_name, function(md){
		m_file_data = $.parseJSON(md);
		
		/* @TODO 判断数据是否一样 */
		editor.session.setValue(m_file_data['data'], -1);
	});
}

/* 保存数据流程 */
function medit_proc_filesave() {
	
	/* @TODO 判断数据是否一样, 如果不一样,才保存, 减少对服务器的请求 */
	file = prompt("请输入文件名:");
	m_file_data['data'] = editor.session.getValue();
	$.post (
		m_url_filesave, 
		m_file_data,
		function (md) {
			alert(file);
		}
	);
}

function medit_proc_newopen() {
	var options = {closeOnCancel:true};
	var inst = $('[data-remodal-id=editor-ui-new').remodal(options);
	inst.open();

	$(document).on('confirmation', '.remodal', function () {
		m_file_name = $("#id-iput-filename").val();
		 $("title").html(m_file_name); 
	});
}

/* 编辑器加载流程 */
function editor_load_proc() {	
	editor_proc_getdata();
	
	/* 触发保存数据流程 */
	$("#editor-save").click(medit_proc_filesave);
	
	/* 触发打开文件的流程 */
	$("#editor-open-new").click(medit_proc_newopen);
	


	
}

$(editor_load_proc);
