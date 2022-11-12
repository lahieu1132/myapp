import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { Space, Table, Tag } from 'antd';
import { Button, Modal, Input } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import axios from "axios";
// styles
import useStyles from "./styles";
import 'antd/dist/antd.css';
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
  return isJpgOrPng && isLt2M;
};

export default function TypographyPage() {
  var classes = useStyles();
  const [list, getList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookDetail, setBookDetail] = useState({

  })
  const [loading, setLoading] = useState(false);
  const [isRegist, setIsRegist] = useState(true);
  const token = window.localStorage.getItem('id_token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
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
  var formData = new FormData;
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
        url: `http://localhost:8080/api/book/${bookDetail.id}`,
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
    setBookDetail({...bookDetail, file: info.file.originFileObj})
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

    const handleInputChange = (key, text) =>{
      console.log(text)
      setBookDetail({...bookDetail, [key]: text})
    }
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={()=>handleSelectBook(record.id)}>{_}</a>
        </Space>
      ),
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
          <span onClick={()=>handleDeleteBook(record.id)}>Delete</span>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space size="large" >
        <span style={{width: "100px"}}>Book Manage</span>
        <button style={{width: "100px"}} onClick={()=>{
          setIsRegist(true)
          setBookDetail({})
          setIsModalOpen(true)
        }}>Tạo mới</button>
      </Space>
      <Table columns={columns} dataSource={list} />
      <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText={isRegist ? "Tạo mới" : "Cập nhật"}>
        
          <Space size="middle" >
            <p style={{width: "100px"}}>Tiêu đề</p>
            <Input placeholder="nhập tiêu đề" value={bookDetail.title} onChange={text => handleInputChange("title", text.target.value)} />
          </Space>
          <Space size="middle">
            <p style={{width: "100px"}} >Tác giả</p>
            <Input placeholder="nhập tác giả" value={bookDetail.author} onChange={text => handleInputChange("author", text.target.value)} />
          </Space>
          <Space size="middle" >
            <p style={{width: "100px"}}>Mô tả</p>
            <Input placeholder="nhập mô tả " value={bookDetail.description} onChange={text => handleInputChange("description", text.target.value)} />
          </Space>
          <Space size="middle">
            <p style={{width: "100px"}}>numberofPage</p>
            <Input placeholder="nhập numberofPage" value={bookDetail.numberofPage} onChange={text => handleInputChange("numberofPage", text.target.value)}/>
          </Space>
          <Space size="middle">
            <p style={{width: "100px"}}>Thể loại</p>
            <Input placeholder="nhập thể loại" value={bookDetail.category} onChange={text => handleInputChange("category", text.target.value)} />
          </Space>
          <Space size="middle">
            <p style={{width: "100px"}}>Ảnh sách</p>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              
            >

              {uploadButton}
              {/* {bookDetail.linkImg ? <img src={require(`./../../../../../../../uploads/${bookDetail.linkImg}`)} alt="avatar" style={{ width: '100%' }} /> : uploadButton} */}
            </Upload>
            <span>{bookDetail.linkImg}</span>
          </Space>

      </Modal>
    </>
  );
}
