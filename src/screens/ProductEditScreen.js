import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";



const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function ProductEditScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });
    const [selectedFile, setSelectedFile] = useState()
    const [preview, setPreview] = useState()
    const [bookDetail, setBookDetail] = useState({
      title:"",
      author:"",
      description:"",
      numberofPage: "",
      file: undefined
    })

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`http://localhost:8080/api/book/${location.state?.id}`);
      console.log("adasd")
      try {
        // dispatch({ type: 'FETCH_REQUEST' });
        setBookDetail({...data.book})
        // dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    !location.state.isRegist && fetchData();
  }, [location]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/products/${location.state?.id}`,
        {
          _id: location.state?.id,

        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  const handleInputChange = (key, text) =>{
    console.log(text.target.value)
    setBookDetail({...bookDetail, [key]: text.target.value})
  }
  

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!selectedFile) {
            setPreview(`http://localhost:3000/images/${bookDetail.linkImg}`)
            return
        }
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)
        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile, bookDetail])

    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }
        setSelectedFile(e.target.files[0])
        setBookDetail({...bookDetail, file: e.target.files[0]})
    }
    const [isUpdateMode, setUpdateMode] = useState(false);
    const handleOk = async () => {
      console.log(bookDetail)
      var formData = new FormData();
      formData.append("title",(bookDetail.title))
      formData.append("author",(bookDetail.author))
      formData.append("description",(bookDetail.description))
      formData.append("date", bookDetail.date)
      formData.append("numberofPage",(bookDetail.numberofPage))
      formData.append("category",(bookDetail.category))
      formData.append("price",(bookDetail.price))
      if(bookDetail.file == null) {
        formData.append("linkImg",bookDetail.linkImg)
      }
      else {
        formData.append("file",bookDetail.file)
      }
      if(location.state?.isRegist) { 
        await axios({
          method: "post",
          url: "http://localhost:8080/api/book/create",
          data: formData,
          headers: { "Content-Type": "multipart/form-data","Authorization": `Bearer ${userInfo.token}`  },
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
          headers: { "Content-Type": "multipart/form-data","Authorization": `Bearer ${userInfo.token}`  },
        })
              .then(res => {
                console.log(res.data)
              })
      }
    }

    const renderButtonArea = () => {
      if(location.state?.isRegist) {
          return <div className="button-area">
              <Button style={{marginRight:"20px"}} width="55px" color="white" onClick={()=> navigate(-1)}>Hủy</Button>
              <Button width="55px" onClick={handleOk}>Thêm mới</Button>
          </div>
      } else if(isUpdateMode) {
          return <div className="button-area">
              <Button style={{marginRight:"20px"}} width="55px" color="white" onClick={() => setUpdateMode(false)}>Hủy</Button>
              <Button width="55px" onClick={handleOk}>Cập nhật</Button>
          </div>
      } else {
          return <div className="button-area">
              <Button style={{marginRight:"20px"}} width="55px" color="white" onClick={()=> navigate(-1)}>Hủy</Button>
              <Button width="55px" onClick={() => setUpdateMode(true)}>Sửa</Button>
          </div>
      }
  }
  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Product</title>
      </Helmet>
      <h1>Edit Product {location?.state?.id}</h1>
      <Form onSubmit={submitHandler}>
          <Row className="mb-3">
            <Form.Group as={Col}  controlId="name">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                value={bookDetail?.title}
                onChange={(value)=>handleInputChange("title", value)}
                required
                disabled={!isUpdateMode && !location.state.isRegist}
              />
            </Form.Group>
            <Form.Group as={Col}  controlId="slug">
              <Form.Label>Tác giả</Form.Label>
              <Form.Control
                value={bookDetail?.author}
                onChange={(value)=>handleInputChange("author", value)}
                required
                disabled={!isUpdateMode && !location.state.isRegist}
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Mô tả về sách</Form.Label>
            <Form.Control
              value={bookDetail?.description}
              onChange={(value)=>handleInputChange("description", value)}
              required
              disabled={!isUpdateMode && !location.state.isRegist}
            />
          </Form.Group>
          <Row
            className="mb-3"
          >
            <Form.Group as={Col}  controlId="date">
              <Form.Label>date</Form.Label>
                <DatePicker
                  selected={typeof bookDetail?.date?.getMonth === 'function' ? bookDetail?.date : Date.parse(bookDetail.date)}
                  onChange={(e) => {
                      console.log(e)
                      setBookDetail({...bookDetail, date: e})
                    }}
                  className="form-control"
                disabled={!isUpdateMode && !location.state.isRegist}
                  customInput={
                    <input
                      type="text"
                      id="validationCustom01"
                      placeholder="First name"
                    />
                  }
                />
            </Form.Group>
            <Form.Group as={Col}  controlId="category">
              <Form.Label>numberofPage</Form.Label>
              <Form.Control
                type='number'
                value={bookDetail?.numberofPage}
                onChange={(value)=>handleInputChange("numberofPage", value)}
                required
                disabled={!isUpdateMode && !location.state.isRegist}
              />
            </Form.Group>
          </Row>
          <Row
            className="mb-3"
          >
            <Form.Group as={Col} controlId="category">
                <Form.Label>category</Form.Label>
                <Form.Select aria-label="Default select example" 
                  disabled={!isUpdateMode && !location.state.isRegist}
                  
                >
                  <option>Open this select menu</option>
                  <option value="Sách thiếu nhi">Sách thiếu nhi</option>
                  <option value="Sách văn học">Sách văn học</option>
                  <option value="Sách giáo khoa">Sách giáo khoa</option>
                  <option value="Sách khoa học">Sách khoa học</option>
                </Form.Select>
              </Form.Group>
            <Form.Group as={Col} controlId="description">
              <Form.Label>price</Form.Label>
              <Form.Control
                type='number'
                value={bookDetail?.price}
                onChange={(value)=>handleInputChange("price", value)}
                required
                disabled={!isUpdateMode && !location.state.isRegist}
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="countInStock">
            <Form.Label>file</Form.Label>
            {
              isUpdateMode | location.state.isRegist && 
              <Form.Control
                type='file'
                onChange={onSelectFile}
                required
              />
            }
          </Form.Group>
          {
            preview ? 
            <img src={preview} alt="" 
              style={{width:"100%", height:"300px", objectFit:"contain", marginBottom:"20px"}} />
            :
            <div style={{width:"100%", height:"300px", border: "1px black solid", marginBottom:"20px"}} />
          }
            
          {renderButtonArea()}
        </Form>
    </Container>
  );
}
