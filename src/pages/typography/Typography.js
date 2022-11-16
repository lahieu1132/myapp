import React, { useEffect, useState, createRef } from "react";
import { Space, Table } from 'antd';
import { Modal, Input } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, DatePicker, Button } from 'antd';
import axios from "axios";
import { UploadOutlined } from '@ant-design/icons';
import { Form, Select } from 'antd';
// styles
import useStyles from "./styles";
import 'antd/dist/antd.css';
import { useHistory } from "react-router-dom";
// components

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M
};

export default function TypographyPage() {
  const history = useHistory()
  const [list, getList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookDetail, setBookDetail] = useState({

  })
  const [imageUrl, setImageUrl] = useState("")
  const [isRegist, setIsRegist] = useState(true);
  const token = window.localStorage.getItem('id_token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const formRef = createRef()
  const { TextArea } = Input;
  const { Option } = Select;
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));


  useEffect(()=>{
    getListBook()
  },[])

  const getListBook = async () => {
    await axios.get("http://localhost:8080/api/book", config)
            .then(res => {
              getList(res.data.books)
            })
  }
  const handleDeleteBook = async (id) => {
    await axios.delete(`http://localhost:8080/api/book/${id}`, config)
            .then(res => {
              getListBook();
            })
  }
  const getBookDetail = async (id) => {
    await axios.get(`http://localhost:8080/api/book/${id}`, config)
            .then(res => {
              console.log(res.data.book)
              setBookDetail(res.data.book)
            })
  }
  const handleOk = async () => {
    console.log(bookDetail.file)
    var formData = new FormData();
    formData.append("title",(bookDetail.title))
    formData.append("author",(bookDetail.author))
    formData.append("description",(bookDetail.description))
    formData.append("date", "11-02-3020")
    formData.append("numberofPage",(bookDetail.numberofPage))
    formData.append("category",(bookDetail.category))
  
    if(isRegist) { 
  formData.append("file",bookDetail.file)
      console.log(...formData)
      await axios({
        method: "post",
        url: "http://localhost:8080/api/book/create",
        data: formData,
        headers: { "Content-Type": "multipart/form-data","Authorization": `Bearer ${token}`  },
      })
        .then(res => {
              console.log(res.data)
              getListBook()
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
              getListBook()
            })
    }
    setIsModalOpen(false);

  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleSelectBook = (id) =>{
    setIsModalOpen(true)
    getBookDetail(id)
    setIsRegist(false)
  }

  const handleChange = (info) => {
    const [file] = info.target.files
    if (file) {
      setImageUrl(URL.createObjectURL(file))
      setBookDetail({...bookDetail, file: file})
    }
  };


    const handleInputChange = (key, text) =>{
      console.log(text)
      setBookDetail({...bookDetail, [key]: text})
    }
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      key: 'date',
      dataIndex: 'date',
    },
    {
      title: 'Category',
      key: 'category',
      dataIndex: 'category',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={()=>{
            if(!user) history.push("/login")
            handleDeleteBook(record.id)
          }}>Delete</Button>
          <Button color="primary" onClick={()=>{
            if(!user) history.push("/login")
          }}>View</Button>
        </Space>
        
      ),
    },
  ];
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const onFinish = async (values) => {
    console.log(values);
    await setBookDetail({...bookDetail, ...values})
    await handleOk()
    await setBookDetail({})
  };

  return (
    <>
      <Space size="large" >
        <span style={{width: "100px"}}>Book Manage</span>
        <button style={{width: "100px"}} onClick={()=>{
          if(!user) history.push("/login")
          setIsRegist(true)
          setBookDetail({})
          setIsModalOpen(true)
        }}>Tạo mới</button>
      </Space>
      <Table columns={columns} dataSource={list} />
      <Modal title={isRegist ? "Tạo mới" : "Chi tiết"} width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText={""}>
        <Form {...layout} ref={formRef} name="control-ref" onFinish={onFinish} labelAlign="left" layout="vertical">
          <Space direction="horizontal">
          <Space direction="vertical">
          <Space direction="horizontal">
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Mô tả về sách">
            <TextArea rows={4} />
          </Form.Item>
          <Space>
            <Form.Item name="date" label="Ngày Phát hành" rules={[{ required: true }]}>
              <DatePicker
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
            <Form.Item name="numberofPage" label="Số Trang">
              <Input />
            </Form.Item>
          </Space>
          <Form.Item
            name={'category'}
            noStyle
            rules={[{ message: 'Province is required' }]}
            label="Thể loại"
          >
            <Select placeholder="Thể loại">
              <Option value="Sách thiếu nhi">Sách thiếu nhi</Option>
              <Option value="Sách Người Lớn">Sách Người Lớn</Option>
            </Select>
          </Form.Item>
          </Space>
          <Space direction="vertical">
            <input type="file" onChange={handleChange}/>
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '200px', height: "200px" }} /> : <div style={{ width: '200px', height: "200px" }}></div>}
          </Space>
          </Space>
          <Form.Item >
            <Button type="primary" htmlType="submit">{isRegist ? "Tạo mới" : "Cập nhật"}</Button>
          </Form.Item>
        </Form>

      </Modal>
    </>
  );
}
