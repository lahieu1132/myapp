import React, { useState, useEffect } from "react";
import {

  Button
} from "@material-ui/core";
import { Space, Table } from 'antd';
import { useHistory } from "react-router-dom";
import axios from "axios";


import PageTitle from "../../components/PageTitle";


export default function Dashboard(props) {
  const history = useHistory()
  const [list, getList] = useState([])
  const token = window.localStorage.getItem('id_token')
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  const [isRegist, setIsRegist] = useState(true);

  useEffect(()=>{
    getListBook()
  },[])
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
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
            history.push({
              pathname: "/app/book",
              state: {isRegist: false, id: record.id }
            })
          }}>View</Button>
        </Space>
        
      ),
    },
  ];
  return (
    <>
      <PageTitle title="Dashboard" />
      <Space size="large" style={{marginBottom: "20px"}}>
        <button style={{width: "100px"}} onClick={()=>{
          if(!user) history.push("/login")
          setIsRegist(true)
          history.push({
            pathname: "/app/book",
            state: {isRegist: true}
          })
        }}>Tạo mới</button>        
      </Space>
      <Table columns={columns} dataSource={list} pagination={{ pageSize:8 }} scroll={{ y: 500 }}/>
    </>
  );
}

