import React, { useEffect, useState, createRef } from "react";
import { Space, Table } from 'antd';
import { Modal, Input, Button, Row, Col } from 'antd';
import {  DatePicker } from 'antd';
import axios from "axios";
import { Form, Select } from 'antd';
// styles
import 'antd/dist/antd.css';
import './style.css';
import { useHistory, useLocation } from "react-router-dom";
// components

export default function BookPage() {
  const history = useHistory()
  const location = useLocation();
  const state = location.state;
  const [isUpdateMode, setUpdateMode] = useState(false);
  const [bookDetail, setBookDetail] = useState({

  })
  
  const [imageUrl, setImageUrl] = useState("")
  const token = window.localStorage.getItem('id_token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const formRef = createRef()
  const { TextArea } = Input;
  const { Option } = Select;
  
  useEffect(() => {
    if (!state?.isRegist) getBookDetail()
    
  }, [state?.isRegist])


  const getBookDetail = async () => {
    await axios.get(`http://localhost:8080/api/book/${state?.id}`, config)
            .then(res => {
              console.log(res.data.book)
              setBookDetail(res.data.book)
            })
  }
  const handleOk = async () => {
    console.log(bookDetail)
    var formData = new FormData();
    formData.append("title",(bookDetail.title))
    formData.append("author",(bookDetail.author))
    formData.append("description",(bookDetail.description))
    formData.append("date", bookDetail.date)
    formData.append("numberofPage",(bookDetail.numberofPage))
    formData.append("category",(bookDetail.category))
  
    if(state?.isRegist) { 
      formData.append("file",bookDetail.file)
      await axios({
        method: "post",
        url: "http://localhost:8080/api/book/create",
        data: formData,
        headers: { "Content-Type": "multipart/form-data","Authorization": `Bearer ${token}`  },
      })
        .then(res => {
              console.log(res.data)
            })
    }
    else {
      await axios({
        method: "post",
        url: `http://localhost:8080/api/book/update/${bookDetail.id}`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data","Authorization": `Bearer ${token}`  },
      })
            .then(res => {
              console.log(res.data)
            })
    }

  };

  const handleChange = (info) => {
    const [file] = info.target.files
    if (file) {
      setImageUrl(URL.createObjectURL(file))
      setBookDetail({...bookDetail, file: file})
    }
  };


    const handleInputChange = (key, text) =>{
      console.log(text.target.value)
      setBookDetail({...bookDetail, [key]: text.target.value})
    }

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const onFinish = async (values) => {
    console.log(values);
    await handleOk()
    await setBookDetail({})
  };
  const renderButtonArea = () => {
    if(state?.isRegist) {
        return <div className="button-area">
            <Button width="55px" color="white" onClick={()=> history.push('')}>Hủy</Button>
            <Button width="55px" onClick={handleOk}>Thêm mới</Button>
        </div>
    } else if(isUpdateMode) {
        return <div className="button-area">
            <Button width="55px" color="white" onClick={() => setUpdateMode(false)}>Hủy</Button>
            <Button width="55px" onClick={handleOk}>Cập nhật</Button>
        </div>
    } else {
        return <div className="button-area">
            <Button width="55px" color="white" onClick={()=> history.push('')}>Hủy</Button>
            <Button width="55px" onClick={() => setUpdateMode(true)}>Sửa</Button>
        </div>
    }
}
  return (
    <>
      <Space size="large" >
        <span style={{width: "100px"}}>Book Manage</span>
      </Space>
      <Form {...layout} ref={formRef} name="control-ref" onFinish={onFinish} labelAlign="left" layout="vertical"
          fields={[{name: "title", value: bookDetail.title},
          {name: "author", value: bookDetail.author},
        ]}
          onFieldsChange={(_, allFields) => {
            if(_[0].name[0] === "date") {
              setBookDetail({...bookDetail, date: _[0].value?._d.toISOString().slice(0, 10)})
            }
          }}
          disabled={!isUpdateMode && !state.isRegist}
        >
          <Row >  
            <Col>
              <Form.Item name="title"  label="Tiêu đề"  rules={[{ required: true }]}
                style={{ display: 'inline-block', width: '30vw', minWidth: "320px" }}
              >
                <Input onChange={(value)=>handleInputChange("title", value)}  />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="author"  label="Tác giả" rules={[{ required: true }]}
                style={{ display: 'inline-block', width: '30vw', minWidth: "320px" }}
              >
                <Input value={bookDetail.author} onChange={(value)=>handleInputChange("author", value)}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả về sách">
            <TextArea rows={4} value={bookDetail.description} onChange={(value)=>handleInputChange("description", value)}/>
          </Form.Item>
            <Form.Item name="date" label="Ngày Phát hành" rules={[{ required: true }]}>
              <DatePicker
                onChange={value => setBookDetail({...bookDetail, date: value?._d.toISOString().slice(0, 10)})}
                dateRender={current => {
                  const style = {};
                  if (current.date() === 1) {
                    style.border = '1px solid #1890ff';
                    style.borderRadius = '50%';
                  }
                  return (
                    <div className="ant-picker-cell-inner" style={style}>
                      {current.date()}
                    </div>
                  );
                }}
              />
            </Form.Item>
            <Form.Item label="Số Trang">
              <Input value={bookDetail.numberofPage} onChange={(value)=>handleInputChange("numberofPage", value)}/>
            </Form.Item>
          <Form.Item
            label="Thể loại"
          >
            <Select placeholder="Thể loại" value={bookDetail.category} onChange={(value)=>setBookDetail({...bookDetail, category: value})}>
              <Option value="Sách thiếu nhi">Sách thiếu nhi</Option>
              <Option value="Sách Người Lớn">Sách Người Lớn</Option>
            </Select>
          </Form.Item>
            <input type="file" onChange={handleChange}/>
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '200px', height: "200px" }} /> : <div style={{ width: '200px', height: "200px" }}></div>}
      </Form>
      {renderButtonArea()}
    </>
  );
}
