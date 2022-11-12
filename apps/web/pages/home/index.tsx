import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { get, find, map } from "lodash";

import { setUser } from "../../store/reducers/userSlice";
import { getQuantsByTags } from "../../utils/quantsByTags";
import {
  IUser,
  QuantItem,
  Tags,
  IQuant,
  IQuantsByTags,
  NewQuantSection,
} from "ui";
import findExistingUser from "../../utils/findExistingUser";
import dbConnect from "../../utils/dbConnect";
import Quant from "../../models/Quant";
import { wrapper } from "../../store";

interface Props {
  quants: IQuant[];
  user: IUser;
}

const Web = ({ quants, user }: Props) => {
  const [input, setInput] = useState("");
  const [quantsByTags, setQuantsByTags] = useState<IQuantsByTags>();
  const [displayQuants, setDisplayQuants] = useState<IQuant[]>([]);
  const [filter, setFilter] = useState("Tasks");
  const [tags, setTags] = useState([]);

  const createQuant = () => {
    axios.post("/api/quant", { name: input, user: user.address }).then(
      (response) => {
        setInput("");
        const newQuant = response.data.data;
        setDisplayQuants([...displayQuants, newQuant]);
      },
      (err) => {
        console.log(err.text);
      }
    );
  };

  useEffect(() => {
    if (quants) {
      //@ts-ignore
      setQuantsByTags(getQuantsByTags(quants));
    }
  }, []);

  useEffect(() => {
    if (quantsByTags) {
      const quants = get(quantsByTags, filter, []);
      setDisplayQuants(quants);
    }

    const tags = map(quantsByTags, "tag");
    //@ts-ignore
    setTags(tags);
    //@ts-ignore
    setDisplayQuants(find(quantsByTags, (tag) => tag.tag === "ViewAll"));
  }, [quantsByTags]);

  useEffect(() => {
    if (filter) {
      //@ts-ignore
      setDisplayQuants(
        (
          //@ts-ignore
          quantsByTags?.find((t: IQuantsByTags) => t.tag === filter) || {
            quants: [],
          }
        ).quants
      );
    }
  }, [filter, quantsByTags]);

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      <NewQuantSection
        createQuant={createQuant}
        input={input}
        setInput={setInput}
      />
      <Tags setFilter={setFilter} tags={tags} />
      <div>
        {map(displayQuants, (quant: IQuant, key: number) => {
          return (
            <div key={key}>
              <QuantItem
                setQuantsByTags={setQuantsByTags}
                displayQuants={displayQuants}
                quantsByTags={quantsByTags}
                setDisplayQuants={setDisplayQuants}
                quant={quant}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default Web;

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ query, req }) => {
      const userId = get(req, "cookies._id");

      const userResult = await findExistingUser("_id", userId);
      const user = JSON.parse(JSON.stringify(userResult));
      store.dispatch(setUser(user));

      await dbConnect();
      const result = await Quant.find({ user: user.address, status: "1" });
      const quants = JSON.parse(JSON.stringify(result));


      return {
        props: {
          quants,
          user,
        },
      };
    }
);