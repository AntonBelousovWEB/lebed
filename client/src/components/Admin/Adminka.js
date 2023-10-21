import React, { useState } from "react";
import { ADD_POST } from "../../mutation/addPost";
import { useMutation } from "@apollo/client";

export default function Adminka() {
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [img, setImg] = useState("");
  const [link, setLink] = useState("");
  const [addPost] = useMutation(ADD_POST);

  const sendPost = () => {
    addPost({
      variables: {
        addPostInput: {
          title: title,
          desc: desc,
          img: img,
          link: link,
        },
      },
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <div className="form_post">
      <p>Добавить Пост</p>
      <input
        className="input_admin"
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="input_admin"
        type="text"
        placeholder="Описание"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <input
        className="input_admin"
        type="text"
        placeholder="Ссылка на изображение"
        value={img}
        onChange={(e) => setImg(e.target.value)}
      />
      <input
        className="input_admin"
        type="text"
        placeholder="Ссылка"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button className="admin_button" onClick={() => sendPost()}>
        Отправить
      </button>
    </div>
  );
}
